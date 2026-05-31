import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterResponsableDto } from '../auth/dto/create-auth.dto';

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

  // ─── Liste tous les responsables ─────────────────────────────────────────
  async getResponsables() {
    return this.prisma.responsableSite.findMany({
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true, createdAt: true,
        site: { select: { id: true, nom: true, code: true, couleur: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Stats cards globales (avec filtres site + plage de dates) ────────────
  async getStatsCards(siteId?: string, dateDebut?: string, dateFin?: string) {
    const siteFilter = siteId ? { siteId } : {};
    const dateRange = this.buildDateRange(dateDebut, dateFin);
    const rapportFilter = { ...siteFilter, ...(dateRange ? { date: dateRange } : {}) };

    const [totalSites, totalTechniciens, totalRapports, equipements, rapports] = await Promise.all([
      this.prisma.site.count(),
      this.prisma.technicien.count({ where: siteFilter }),
      this.prisma.rapportJournalier.count({ where: rapportFilter }),
      this.prisma.equipement.findMany({ where: siteFilter, select: { statut: true } }),
      this.prisma.rapportJournalier.findMany({
        where: rapportFilter,
        include: { lignes: { select: { statut: true, typesPannes: true } } },
      }),
    ]);

    const totalEquipements      = equipements.length;
    const equipementsOperationnel = equipements.filter(e => e.statut === 'ACTIF').length;
    const equipementsEnPanne      = equipements.filter(e => e.statut === 'EN_MAINTENANCE').length;
    const equipementsInactifs     = equipements.filter(e => e.statut === 'INACTIF').length;

    const totalLignes    = rapports.reduce((s, r) => s + r.lignes.length, 0);
    const totalOp        = rapports.reduce((s, r) => s + r.lignes.filter(l => l.statut === 'OPERATIONNEL').length, 0);
    const totalEnPanne   = rapports.reduce((s, r) => s + r.lignes.filter(l => l.statut === 'EN_PANNE').length, 0);
    const totalAccidente = rapports.reduce((s, r) => s + r.lignes.filter(l => l.statut === 'ACCIDENTE').length, 0);
    const totalEnAttente = rapports.reduce((s, r) => s + r.lignes.filter(l => l.statut === 'EN_ATTENTE').length, 0);

    // Comptage types de pannes
    const pannesCount: Record<string, number> = {};
    rapports.forEach(r =>
      r.lignes.forEach(l =>
        l.typesPannes.forEach(p => { pannesCount[p] = (pannesCount[p] ?? 0) + 1; })
      )
    );
    const topPannes = Object.entries(pannesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      totalSites,
      totalEquipements,
      equipementsOperationnel,
      equipementsEnPanne,
      equipementsInactifs,
      totalTechniciens,
      totalRapports,
      totalLignes,
      tauxOperationnel: totalLignes > 0 ? Math.round((totalOp / totalLignes) * 100) : 0,
      vehiculesParStatut: {
        operationnel: totalOp,
        enPanne:      totalEnPanne,
        accidente:    totalAccidente,
        enAttente:    totalEnAttente,
      },
      topPannes,
    };
  }

  // ─── Données graphique (évolution journalière par site) ──────────────────
  async getGraphData(siteId?: string, dateDebut?: string, dateFin?: string) {
    const siteFilter = siteId ? { siteId } : {};
    const dateRange  = this.buildDateRange(dateDebut, dateFin);
    const where = { ...siteFilter, ...(dateRange ? { date: dateRange } : {}) };

    const rapports = await this.prisma.rapportJournalier.findMany({
      where,
      include: {
        site:   { select: { id: true, nom: true, code: true, couleur: true } },
        lignes: { select: { statut: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Série temporelle : un point par rapport
    const series = rapports.map(r => ({
      date:            r.date.toISOString().split('T')[0],
      siteId:          r.siteId,
      siteNom:         r.site.nom,
      siteCouleur:     r.site.couleur,
      total:           r.lignes.length,
      operationnel:    r.lignes.filter(l => l.statut === 'OPERATIONNEL').length,
      enPanne:         r.lignes.filter(l => l.statut === 'EN_PANNE').length,
      accidente:       r.lignes.filter(l => l.statut === 'ACCIDENTE').length,
      enAttente:       r.lignes.filter(l => l.statut === 'EN_ATTENTE').length,
      tauxOperationnel: r.lignes.length > 0
        ? Math.round((r.lignes.filter(l => l.statut === 'OPERATIONNEL').length / r.lignes.length) * 100)
        : 0,
    }));

    // Agrégat par site (utile pour graphiques en barres/camembert)
    const bySite: Record<string, { siteNom: string; siteCouleur: string | null; totalRapports: number; totalVehicules: number; operationnel: number; enPanne: number; accidente: number; enAttente: number }> = {};
    for (const r of rapports) {
      if (!bySite[r.siteId]) {
        bySite[r.siteId] = { siteNom: r.site.nom, siteCouleur: r.site.couleur, totalRapports: 0, totalVehicules: 0, operationnel: 0, enPanne: 0, accidente: 0, enAttente: 0 };
      }
      bySite[r.siteId].totalRapports++;
      bySite[r.siteId].totalVehicules  += r.lignes.length;
      bySite[r.siteId].operationnel    += r.lignes.filter(l => l.statut === 'OPERATIONNEL').length;
      bySite[r.siteId].enPanne         += r.lignes.filter(l => l.statut === 'EN_PANNE').length;
      bySite[r.siteId].accidente       += r.lignes.filter(l => l.statut === 'ACCIDENTE').length;
      bySite[r.siteId].enAttente       += r.lignes.filter(l => l.statut === 'EN_ATTENTE').length;
    }

    return {
      series,
      bySite: Object.entries(bySite).map(([id, v]) => ({ siteId: id, ...v })),
    };
  }

  // ─── Utilitaire plage de dates ────────────────────────────────────────────
  private buildDateRange(dateDebut?: string, dateFin?: string) {
    if (!dateDebut && !dateFin) return null;
    const gte = dateDebut ? new Date(dateDebut + 'T00:00:00.000Z') : undefined;
    const lte = dateFin   ? new Date(dateFin   + 'T23:59:59.999Z') : undefined;
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
  }

  // ─── Créer un responsable de site ────────────────────────────────────────
  async createResponsable(dto: RegisterResponsableDto) {
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
    if (!site) throw new NotFoundException(`Site introuvable: ${dto.siteId}`);

    const existingEmail = await this.prisma.responsableSite.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Cet email est déjà utilisé');

    const existingSite = await this.prisma.responsableSite.findUnique({ where: { siteId: dto.siteId } });
    if (existingSite) throw new ConflictException('Ce site a déjà un responsable assigné');

    const hash = await bcrypt.hash(dto.password, 10);

    const responsable = await this.prisma.responsableSite.create({
      data: {
        nom: dto.nom, prenom: dto.prenom,
        email: dto.email, password: hash,
        telephone: dto.telephone ?? null,
        siteId: dto.siteId,
      },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true, createdAt: true,
        site: { select: { id: true, nom: true, code: true, couleur: true } },
      },
    });

    return responsable;
  }

  // --- Modifier un responsable
  async updateResponsable(id: string, dto: { nom?: string; prenom?: string; telephone?: string }) {
    const responsable = await this.prisma.responsableSite.findUnique({ where: { id } });
    if (!responsable) throw new NotFoundException(`Responsable introuvable: ${id}`);

    return this.prisma.responsableSite.update({
      where: { id },
      data: {
        ...(dto.nom       !== undefined && { nom: dto.nom }),
        ...(dto.prenom    !== undefined && { prenom: dto.prenom }),
        ...(dto.telephone !== undefined && { telephone: dto.telephone }),
      },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true, createdAt: true,
        site: { select: { id: true, nom: true, code: true, couleur: true } },
      },
    });
  }

  // --- Supprimer un responsable
  async deleteResponsable(id: string) {
    const responsable = await this.prisma.responsableSite.findUnique({ where: { id } });
    if (!responsable) throw new NotFoundException(`Responsable introuvable: ${id}`);

    await this.prisma.responsableSite.delete({ where: { id } });
    return { message: `Responsable ${id} supprime avec succes` };
  }
}