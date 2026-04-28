import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { Statut, StatutIntervention } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

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
    const actifs = await this.prisma.technicien.count({ where: { statut: Statut.ACTIF } });
    const enMaintenance = await this.prisma.technicien.count({ where: { statut: Statut.EN_MAINTENANCE } });
    const inactifs = await this.prisma.technicien.count({ where: { statut: Statut.INACTIF } });
    
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
      techniciensAvecInterventionsEnCours: techniciensAvecInterventionsEnCours,
    };
  }
}
