import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { Statut, StatutIntervention, Priorite } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getGlobalStatistics() {
    // Statistiques des interventions
    const totalInterventions = await this.prisma.intervention.count();
    const interventionsEnCours = await this.prisma.intervention.count({ 
      where: { statut: StatutIntervention.EN_COURS } 
    });
    const interventionsTerminees = await this.prisma.intervention.count({ 
      where: { statut: StatutIntervention.TERMINEE } 
    });
    const interventionsUrgentes = await this.prisma.intervention.count({ 
      where: { priorite: Priorite.URGENTE } 
    });
    const interventionsEnAttente = await this.prisma.intervention.count({ 
      where: { statut: StatutIntervention.EN_ATTENTE } 
    });

    // Statistiques des techniciens
    const totalTechniciens = await this.prisma.technicien.count();
    const techniciensActifs = await this.prisma.technicien.count({ 
      where: { statut: Statut.ACTIF } 
    });

    // Statistiques des véhicules
    const totalVehicules = await this.prisma.vehicule.count();
    const vehiculesActifs = await this.prisma.vehicule.count({ 
      where: { statut: Statut.ACTIF } 
    });
    const vehiculesEnMaintenance = await this.prisma.vehicule.count({ 
      where: { statut: Statut.EN_MAINTENANCE } 
    });

    // Coûts totaux
    const coutTotalInterventions = await this.prisma.intervention.aggregate({
      _sum: { cout: true }
    });

    return {
      interventions: {
        total: totalInterventions,
        enCours: interventionsEnCours,
        terminees: interventionsTerminees,
        urgentes: interventionsUrgentes,
        enAttente: interventionsEnAttente,
        coutTotal: coutTotalInterventions._sum.cout || 0
      },
      techniciens: {
        total: totalTechniciens,
        actifs: techniciensActifs,
        tauxActivite: totalTechniciens > 0 ? (techniciensActifs / totalTechniciens * 100).toFixed(1) : 0
      },
      vehicules: {
        total: totalVehicules,
        actifs: vehiculesActifs,
        enMaintenance: vehiculesEnMaintenance,
        tauxDisponibilite: totalVehicules > 0 ? (vehiculesActifs / totalVehicules * 100).toFixed(1) : 0
      }
    };
  }
}
