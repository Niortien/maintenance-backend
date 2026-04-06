import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { Priorite, StatutIntervention } from '@prisma/client';

@Injectable()
export class InterventionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateInterventionDto) {
    const vehicule = await this.prisma.vehicule.findUnique({ where: { id: createDto.vehiculeId } });
    if (!vehicule) throw new NotFoundException(`Véhicule avec l'ID '${createDto.vehiculeId}' introuvable`);

    const technicien = await this.prisma.technicien.findUnique({ where: { id: createDto.technicienId } });
    if (!technicien) throw new NotFoundException(`Technicien avec l'ID '${createDto.technicienId}' introuvable`);

    // Normalisation des valeurs
    const priorite = Object.values(Priorite).includes(createDto.priorite) ? createDto.priorite : Priorite.MOYENNE;
    const statut = Object.values(StatutIntervention).includes(createDto.statut) ? createDto.statut : StatutIntervention.EN_ATTENTE;

    // Conversion Int si nécessaire
    const temps_estime = Math.round(createDto.temps_estime_heures);
    const temps_reel = createDto.temps_reel_heures ? Math.round(createDto.temps_reel_heures) : null;

    return this.prisma.intervention.create({
      data: {
        date: new Date(createDto.date),
        description: createDto.description,
        situation: createDto.situation,
        designation: createDto.designation,
        priorite,
        cout: createDto.cout,
        temps_estime_heures: temps_estime,
        temps_reel_heures: temps_reel,
        pieces_utilisees: createDto.pieces_utilisees,
        notes_additionnelles: createDto.notes_additionnelles,
        statut,
        vehicule: { connect: { id: createDto.vehiculeId } },
        technicien: { connect: { id: createDto.technicienId } },
      },
      include: { vehicule: true, technicien: true },
    });
  }

  async findAll() {
    return this.prisma.intervention.findMany({ include: { vehicule: true, technicien: true } });
  }

  async findOne(id: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: { vehicule: true, technicien: true },
    });
    if (!intervention) throw new NotFoundException(`Intervention avec l'ID '${id}' introuvable`);
    return intervention;
  }

  async update(id: string, updateDto: UpdateInterventionDto) {
    const interventionExist = await this.prisma.intervention.findUnique({ where: { id } });
    if (!interventionExist) throw new NotFoundException(`Intervention avec l'ID '${id}' introuvable svp`);

    const data: any = { ...updateDto };

    if (updateDto.vehiculeId) {
      const vehicule = await this.prisma.vehicule.findUnique({ where: { id: updateDto.vehiculeId } });
      if (!vehicule) throw new NotFoundException(`Véhicule avec l'ID '${updateDto.vehiculeId}' introuvable svp`);
      data.vehicule = { connect: { id: updateDto.vehiculeId } };
    }

    if (updateDto.technicienId) {
      const technicien = await this.prisma.technicien.findUnique({ where: { id: updateDto.technicienId } });
      if (!technicien) throw new NotFoundException(`Technicien avec l'ID '${updateDto.technicienId}' introuvable`);
      data.technicien = { connect: { id: updateDto.technicienId } };
    }

    // Normalisation enums
    if (updateDto.priorite && !Object.values(Priorite).includes(updateDto.priorite)) {
      throw new BadRequestException(`Priorité invalide: ${updateDto.priorite}`);
    }
    if (updateDto.statut && !Object.values(StatutIntervention).includes(updateDto.statut)) {
      throw new BadRequestException(`Statut invalide: ${updateDto.statut}`);
    }

    // Conversion Int si nécessaire
    if (updateDto.temps_estime_heures !== undefined) data.temps_estime_heures = Math.round(updateDto.temps_estime_heures);
    if (updateDto.temps_reel_heures !== undefined) data.temps_reel_heures = Math.round(updateDto.temps_reel_heures);

    delete data.vehiculeId;
    delete data.technicienId;

    if (Object.keys(data).length === 0) throw new BadRequestException('Aucun champ à mettre à jour.');

    return this.prisma.intervention.update({
      where: { id },
      data,
      include: { vehicule: true, technicien: true },
    });
  }

  async remove(id: string) {
    const interventionExist = await this.prisma.intervention.findUnique({ where: { id } });
    if (!interventionExist) throw new NotFoundException(`Intervention avec l'ID '${id}' introuvable`);
    return this.prisma.intervention.delete({ where: { id } });
  }

  async getStatistics() {
    const total = await this.prisma.intervention.count();
    const enCours = await this.prisma.intervention.count({ where: { statut: StatutIntervention.EN_COURS } });
    const terminees = await this.prisma.intervention.count({ where: { statut: StatutIntervention.TERMINEE } });
    const urgentes = await this.prisma.intervention.count({ where: { priorite: Priorite.URGENTE } });

    return {
      totalInterventions: total,
      interventionsEnCours: enCours,
      interventionsTerminees: terminees,
      interventionsUrgentes: urgentes,
    };
  }
}
