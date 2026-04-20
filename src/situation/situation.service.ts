import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSituationDto, CreateBesoinLogistiqueDto } from './dto/create-situation.dto';
import { UpdateSituationDto } from './dto/update-situation.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SituationService {
  constructor(private readonly prisma: PrismaService) {}

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
      include: { besoins: true },
    });
    if (!situation) throw new NotFoundException(`Situation '${id}' introuvable`);
    if (situation.siteId !== siteId) {
      throw new ForbiddenException(`Cette situation n'appartient pas à votre site`);
    }
    return situation;
  }

  // ───────────────────────────── CRUD ─────────────────────────────────────

  async findAllBySite(siteId: string) {
    return this.prisma.situation.findMany({
      where: { siteId },
      include: { besoins: true, equipement: { select: { id: true, nom: true, categorie: true } } },
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
    imageFile: Express.Multer.File,
  ) {
    // Verify that the equipment belongs to the same site
    const equipement = await this.prisma.equipement.findUnique({
      where: { id: dto.equipementId },
    });
    if (!equipement) {
      throw new NotFoundException(`Équipement '${dto.equipementId}' introuvable`);
    }
    if (equipement.siteId !== siteId) {
      throw new ForbiddenException(`Cet équipement n'appartient pas à votre site`);
    }

    const nom = `SITUATION ${equipement.nom.toUpperCase()}`;
    const besoins = this.parseBesoins(dto.besoinsLogistiques);
    const imagePath = `uploads/situations/${imageFile.filename}`;

    return this.prisma.situation.create({
      data: {
        nom,
        description: dto.description,
        image: imagePath,
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
      include: { besoins: true, equipement: { select: { id: true, nom: true, categorie: true } } },
    });
  }

  async update(
    id: string,
    siteId: string,
    dto: UpdateSituationDto,
    imageFile?: Express.Multer.File,
  ) {
    const existing = await this.assertOwnership(id, siteId);

    // If a new image is provided, delete the old one
    if (imageFile && existing.image) {
      try {
        await unlink(join(process.cwd(), existing.image));
      } catch {
        // Old file may be missing — proceed silently
      }
    }

    // If besoins are provided, replace them entirely (delete + recreate)
    const besoins = dto.besoinsLogistiques !== undefined
      ? this.parseBesoins(dto.besoinsLogistiques)
      : undefined;

    return this.prisma.situation.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(imageFile && { image: `uploads/situations/${imageFile.filename}` }),
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
      include: { besoins: true, equipement: { select: { id: true, nom: true, categorie: true } } },
    });
  }

  async remove(id: string, siteId: string) {
    const existing = await this.assertOwnership(id, siteId);

    if (existing.image) {
      try {
        await unlink(join(process.cwd(), existing.image));
      } catch {
        // File may already be missing; proceed silently
      }
    }

    return this.prisma.situation.delete({ where: { id } });
  }

  // ───────────────────── Admin: all situations ────────────────────────────

  async findAll() {
    return this.prisma.situation.findMany({
      include: {
        besoins: true,
        equipement: { select: { id: true, nom: true, categorie: true } },
        site: { select: { id: true, nom: true, code: true } },
        responsable: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
