import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { StatutTechnicien, StatutIntervention } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateHistoriqueDto, CloturerHistoriqueDto } from './dto/create-historique.dto';

@Injectable()
export class TechnicienService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTechnicienDto: CreateTechnicienDto, photoFile?: Express.Multer.File) {
    const { siteId, ...rest } = createTechnicienDto;
    return this.prisma.technicien.create({
      data: {
        ...rest,
        photo: photoFile ? `uploads/techniciens/${photoFile.filename}` : null,
        site: { connect: { id: siteId } },
      },
    });
  }

  findAll(siteId: string) {
    return this.prisma.technicien.findMany({
      where: { siteId },
      include: { interventions: true },
    });
  }

  findOne(id: string) {
    return this.prisma.technicien.findUnique({
      where: { id },
      include: { interventions: true },
    });
  }

  async update(id: string, updateTechnicienDto: UpdateTechnicienDto, photoFile?: Express.Multer.File) {
    if (photoFile) {
      const existing = await this.prisma.technicien.findUnique({ where: { id }, select: { photo: true } });
      if (existing?.photo) {
        try { await unlink(join(process.cwd(), existing.photo)); } catch { /* ignore */ }
      }
    }
    const { siteId, ...rest } = updateTechnicienDto;
    return this.prisma.technicien.update({
      where: { id },
      data: {
        ...rest,
        ...(siteId && { site: { connect: { id: siteId } } }),
        ...(photoFile && { photo: `uploads/techniciens/${photoFile.filename}` }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.technicien.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const total = await this.prisma.technicien.count();
    const actifs = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.ACTIF } });
    const enMaintenance = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.EN_MAINTENANCE } });
    const inactifs = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.INACTIF } });
    const enMission = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.EN_MISSION } });
    const enConge = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.EN_CONGE } });
    const malades = await this.prisma.technicien.count({ where: { statut: StatutTechnicien.MALADE } });
    
    // Techniciens avec interventions en cours
    const techniciensAvecInterventionsEnCours = await this.prisma.technicien.count({
      where: {
        interventions: {
          some: {
            statut: StatutIntervention.EN_COURS
          }
        }
      }
    });

    return {
      totalTechniciens: total,
      techniciensActifs: actifs,
      techniciensEnMaintenance: enMaintenance,
      techniciensInactifs: inactifs,
      techniciensEnMission: enMission,
      techniciensEnConge: enConge,
      techniciensMalades: malades,
      techniciensAvecInterventionsEnCours: techniciensAvecInterventionsEnCours,
    };
  }

  // ─── HISTORIQUE ────────────────────────────────────────────────

  async getTechnicienDetails(technicienId: string) {
    const technicien = await this.prisma.technicien.findUnique({
      where: { id: technicienId },
      include: {
        site: { select: { id: true, nom: true, code: true } },
        interventions: {
          orderBy: { date: 'desc' },
          take: 10,
          select: { id: true, date: true, statut: true, description: true, designation: true },
        },
        historique: {
          orderBy: { dateDebut: 'desc' },
        },
      },
    });
    if (!technicien) throw new NotFoundException(`Technicien introuvable: ${technicienId}`);
    return technicien;
  }

  async getHistorique(technicienId: string) {
    const exists = await this.prisma.technicien.findUnique({ where: { id: technicienId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Technicien introuvable: ${technicienId}`);
    return this.prisma.historiqueStatutTechnicien.findMany({
      where: { technicienId },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async addHistorique(technicienId: string, dto: CreateHistoriqueDto) {
    const technicien = await this.prisma.technicien.findUnique({ where: { id: technicienId } });
    if (!technicien) throw new NotFoundException(`Technicien introuvable: ${technicienId}`);

    const [historique] = await this.prisma.$transaction([
      this.prisma.historiqueStatutTechnicien.create({
        data: {
          technicienId,
          statut: dto.statut,
          dateDebut: new Date(dto.dateDebut),
          dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
          lieu: dto.lieu ?? null,
          notes: dto.notes ?? null,
        },
      }),
      this.prisma.technicien.update({
        where: { id: technicienId },
        data: {
          statut: dto.statut,
          lieuMission: dto.statut === 'EN_MISSION' ? (dto.lieu ?? null) : null,
        },
      }),
    ]);
    return historique;
  }

  async cloturerHistorique(technicienId: string, historiqueId: string, dto: CloturerHistoriqueDto) {
    const historique = await this.prisma.historiqueStatutTechnicien.findFirst({
      where: { id: historiqueId, technicienId },
    });
    if (!historique) throw new NotFoundException(`Événement introuvable`);

    const updated = await this.prisma.historiqueStatutTechnicien.update({
      where: { id: historiqueId },
      data: {
        dateFin: new Date(dto.dateFin),
        notes: dto.notes ? (historique.notes ? `${historique.notes} | ${dto.notes}` : dto.notes) : historique.notes,
      },
    });

    // Remettre le technicien ACTIF si aucun autre événement en cours
    const autreEnCours = await this.prisma.historiqueStatutTechnicien.findFirst({
      where: { technicienId, dateFin: null, id: { not: historiqueId } },
    });
    if (!autreEnCours) {
      await this.prisma.technicien.update({
        where: { id: technicienId },
        data: { statut: StatutTechnicien.ACTIF, lieuMission: null },
      });
    }
    return updated;
  }
}

