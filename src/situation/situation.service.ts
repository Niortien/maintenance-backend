import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { StatutSituation } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSituationDto, CreateBesoinLogistiqueDto } from './dto/create-situation.dto';
import { UpdateSituationDto } from './dto/update-situation.dto';
import { UpdateStatutSituationDto } from './dto/update-statut-situation.dto';
import { NotificationService } from 'src/notification/notification.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SituationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ───────────────────────────── helpers ──────────────────────────────────

  private parseBesoins(raw: string | undefined): CreateBesoinLogistiqueDto[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new BadRequestException('besoinsLogistiques doit être un tableau JSON');
      }
      return parsed as CreateBesoinLogistiqueDto[];
    } catch {
      throw new BadRequestException(
        'besoinsLogistiques est invalide — fournir un tableau JSON stringifié',
      );
    }
  }

  private async assertOwnership(id: string, siteId: string) {
    const situation = await this.prisma.situation.findUnique({
      where: { id },
      include: { besoins: true, images: true },
    });
    if (!situation) throw new NotFoundException(`Situation '${id}' introuvable`);
    if (situation.siteId !== siteId) {
      throw new ForbiddenException(`Cette situation n'appartient pas à votre site`);
    }
    return situation;
  }

  // ───────────────────────────── Responsable CRUD ─────────────────────────

  async findAllBySite(siteId: string) {
    return this.prisma.situation.findMany({
      where: { siteId },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBySite(id: string, siteId: string) {
    return this.assertOwnership(id, siteId);
  }

  async create(
    siteId: string,
    responsableId: string,
    dto: CreateSituationDto,
    imageFiles: Express.Multer.File[],
  ) {
    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestException('Au moins une image est requise');
    }

    const equipement = await this.prisma.equipement.findUnique({
      where: { id: dto.equipementId },
    });
    if (!equipement) {
      throw new NotFoundException(`Équipement '${dto.equipementId}' introuvable`);
    }
    if (equipement.siteId !== siteId) {
      throw new ForbiddenException(`Cet équipement n'appartient pas à votre site`);
    }

    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { nom: true },
    });

    const nom = `SITUATION ${equipement.nom.toUpperCase()}`;
    const besoins = this.parseBesoins(dto.besoinsLogistiques);

    const situation = await this.prisma.situation.create({
      data: {
        nom,
        description: dto.description,
        statut: 'EN_ATTENTE',
        images: {
          create: imageFiles.map((f) => ({ url: `uploads/situations/${f.filename}` })),
        },
        equipement: { connect: { id: dto.equipementId } },
        site: { connect: { id: siteId } },
        responsable: { connect: { id: responsableId } },
        besoins: {
          create: besoins.map((b) => ({
            designation: b.designation,
            quantite: b.quantite,
            prixUnitaire: b.prixUnitaire,
          })),
        },
      },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
      },
    });

    // Notifier l'admin
    await this.notificationService.createForNewSituation(
      situation.id,
      situation.nom,
      site?.nom ?? siteId,
    );

    return situation;
  }

  async update(
    id: string,
    siteId: string,
    dto: UpdateSituationDto,
    imageFiles?: Express.Multer.File[],
  ) {
    await this.assertOwnership(id, siteId);

    const besoins =
      dto.besoinsLogistiques !== undefined
        ? this.parseBesoins(dto.besoinsLogistiques)
        : undefined;

    return this.prisma.situation.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(imageFiles &&
          imageFiles.length > 0 && {
            images: {
              create: imageFiles.map((f) => ({ url: `uploads/situations/${f.filename}` })),
            },
          }),
        ...(besoins !== undefined && {
          besoins: {
            deleteMany: {},
            create: besoins.map((b) => ({
              designation: b.designation,
              quantite: b.quantite,
              prixUnitaire: b.prixUnitaire,
            })),
          },
        }),
      },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
      },
    });
  }

  async removeImage(situationId: string, imageId: string, siteId: string) {
    await this.assertOwnership(situationId, siteId);

    const image = await this.prisma.situationImage.findUnique({ where: { id: imageId } });
    if (!image || image.situationId !== situationId) {
      throw new NotFoundException(`Image '${imageId}' introuvable`);
    }

    try {
      await unlink(join(process.cwd(), image.url));
    } catch {
      // File may already be missing; proceed silently
    }

    return this.prisma.situationImage.delete({ where: { id: imageId } });
  }

  async remove(id: string, siteId: string) {
    const existing = await this.assertOwnership(id, siteId);

    for (const img of existing.images) {
      try {
        await unlink(join(process.cwd(), img.url));
      } catch {
        // File may already be missing; proceed silently
      }
    }

    return this.prisma.situation.delete({ where: { id } });
  }

  // ───────────────────────────── Changement de statut ─────────────────────

  /**
   * Responsable : peut passer en EN_COURS ou TERMINEE uniquement
   */
  async updateStatutByResponsable(id: string, siteId: string, dto: UpdateStatutSituationDto) {
    await this.assertOwnership(id, siteId);

    const allowed: StatutSituation[] = [StatutSituation.EN_COURS, StatutSituation.TERMINEE];
    if (!allowed.includes(dto.statut)) {
      throw new ForbiddenException(
        `Un responsable ne peut définir que les statuts : ${allowed.join(', ')}`,
      );
    }

    return this.prisma.situation.update({
      where: { id },
      data: { statut: dto.statut },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
      },
    });
  }

  /**
   * Admin : peut passer à n'importe quel statut
   */
  async updateStatutByAdmin(id: string, dto: UpdateStatutSituationDto) {
    const situation = await this.prisma.situation.findUnique({ where: { id } });
    if (!situation) throw new NotFoundException(`Situation '${id}' introuvable`);

    return this.prisma.situation.update({
      where: { id },
      data: { statut: dto.statut },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
        site: { select: { id: true, nom: true, code: true } },
        responsable: { select: { id: true, nom: true, prenom: true } },
      },
    });
  }

  // ─────────────────────────────── Admin ──────────────────────────────────

  async findAll() {
    return this.prisma.situation.findMany({
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
        site: { select: { id: true, nom: true, code: true } },
        responsable: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const situation = await this.prisma.situation.findUnique({
      where: { id },
      include: {
        besoins: true,
        images: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
        site: { select: { id: true, nom: true, code: true } },
        responsable: { select: { id: true, nom: true, prenom: true } },
      },
    });
    if (!situation) throw new NotFoundException(`Situation '${id}' introuvable`);
    return situation;
  }
}
