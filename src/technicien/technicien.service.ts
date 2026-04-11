import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { Statut, StatutIntervention } from '@prisma/client';

@Injectable()
export class TechnicienService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTechnicienDto: CreateTechnicienDto) {
    return this.prisma.technicien.create({
      data: createTechnicienDto,
    });
  }

  findAll() {
    return this.prisma.technicien.findMany({
      include: { interventions: true },
    });
  }

  findOne(id: string) {
    return this.prisma.technicien.findUnique({
      where: { id },
      include: { interventions: true },
    });
  }

  update(id: string, updateTechnicienDto: UpdateTechnicienDto) {
    return this.prisma.technicien.update({
      where: { id },
      data: updateTechnicienDto,
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
