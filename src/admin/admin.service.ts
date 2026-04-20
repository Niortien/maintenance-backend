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
}
