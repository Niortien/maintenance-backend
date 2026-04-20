import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Tous les sites avec stats ───────────────────────────────────────────
  async getAllSites() {
    return this.prisma.site.findMany({
      include: {
        _count: { select: { vehicules: true, techniciens: true, rapports: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  // ─── Rapports d'un site, optionnellement filtrés par date ────────────────
  async getSiteRapports(siteId: string, date?: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new NotFoundException(`Site introuvable: ${siteId}`);

    const where: { siteId: string; date?: { gte: Date; lte: Date } } = { siteId };

    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setUTCHours(23, 59, 59, 999);
      where.date = { gte: d, lte: dEnd };
    }

    return this.prisma.rapportJournalier.findMany({
      where,
      include: {
        site: { select: { id: true, nom: true, code: true, region: true, couleur: true } },
        lignes: { orderBy: { categorie: 'asc' } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ─── Détail d'un rapport ─────────────────────────────────────────────────
  async getRapportById(id: string) {
    const rapport = await this.prisma.rapportJournalier.findUnique({
      where: { id },
      include: {
        site: { select: { id: true, nom: true, code: true, region: true, couleur: true } },
        lignes: { orderBy: { categorie: 'asc' } },
      },
    });
    if (!rapport) throw new NotFoundException(`Rapport introuvable: ${id}`);
    return rapport;
  }

  // ─── Véhicules d'un site ─────────────────────────────────────────────────
  async getSiteVehicules(siteId: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new NotFoundException(`Site introuvable: ${siteId}`);

    return this.prisma.vehicule.findMany({
      where: { siteId },
      orderBy: { nom: 'asc' },
    });
  }

  // ─── Techniciens d'un site ────────────────────────────────────────────────
  async getSiteTechniciens(siteId: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new NotFoundException(`Site introuvable: ${siteId}`);

    return this.prisma.technicien.findMany({
      where: { siteId },
      include: {
        _count: { select: { interventions: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }
}
