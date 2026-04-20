import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';
import { CategorieEquipement, Statut } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

/** Catégories pour lesquelles l'immatriculation est obligatoire */
const CATEGORIES_IMMAT_REQUIRED: CategorieEquipement[] = [
  CategorieEquipement.BP,
  CategorieEquipement.KIA,
];

@Injectable()
export class EquipementService {
  constructor(private readonly prisma: PrismaService) {}

  private validate(dto: CreateEquipementDto | UpdateEquipementDto): void {
    if (dto.categorie === CategorieEquipement.TASSEUR && dto.nom) {
      if (!/^T/i.test(dto.nom)) {
        throw new BadRequestException(
          'Le nom d\'un TASSEUR doit commencer par la lettre T (ex: T50)',
        );
      }
    }

    if (
      dto.categorie &&
      CATEGORIES_IMMAT_REQUIRED.includes(dto.categorie) &&
      !dto.immatriculation
    ) {
      throw new BadRequestException(
        `L'immatriculation est obligatoire pour la catégorie ${dto.categorie}`,
      );
    }
  }

  async findAllBySite(siteId: string) {
    return this.prisma.equipement.findMany({
      where: { siteId },
      orderBy: [{ categorie: 'asc' }, { nom: 'asc' }],
    });
  }

  async findOneBySite(id: string, siteId: string) {
    const eq = await this.prisma.equipement.findUnique({ where: { id } });
    if (!eq) throw new NotFoundException(`Équipement '${id}' introuvable`);
    if (eq.siteId !== siteId)
      throw new ForbiddenException(`Cet équipement n'appartient pas à votre site`);
    return eq;
  }

  async create(
    siteId: string,
    dto: CreateEquipementDto,
    imageFile?: Express.Multer.File,
  ) {
    this.validate(dto);

    return this.prisma.equipement.create({
      data: {
        nom: dto.nom,
        categorie: dto.categorie,
        immatriculation: dto.immatriculation ?? null,
        statut: dto.statut ?? Statut.ACTIF,
        image: imageFile ? `uploads/equipements/${imageFile.filename}` : null,
        site: { connect: { id: siteId } },
      },
    });
  }

  async update(
    id: string,
    siteId: string,
    dto: UpdateEquipementDto,
    imageFile?: Express.Multer.File,
  ) {
    const existing = await this.findOneBySite(id, siteId);

    // Build merged object for cross-field validation
    const merged = {
      nom: dto.nom ?? existing.nom,
      categorie: dto.categorie ?? existing.categorie,
      immatriculation:
        dto.immatriculation !== undefined
          ? dto.immatriculation
          : existing.immatriculation,
    } as CreateEquipementDto;
    this.validate(merged);

    // Delete old image file if a new one is uploaded
    if (imageFile && existing.image) {
      try {
        await unlink(join(process.cwd(), existing.image));
      } catch {
        // File may already be missing; proceed silently
      }
    }

    return this.prisma.equipement.update({
      where: { id },
      data: {
        ...(dto.nom !== undefined && { nom: dto.nom }),
        ...(dto.categorie !== undefined && { categorie: dto.categorie }),
        ...(dto.immatriculation !== undefined && {
          immatriculation: dto.immatriculation,
        }),
        ...(dto.statut !== undefined && { statut: dto.statut }),
        ...(imageFile && {
          image: `uploads/equipements/${imageFile.filename}`,
        }),
      },
    });
  }

  async remove(id: string, siteId: string) {
    const existing = await this.findOneBySite(id, siteId);

    if (existing.image) {
      try {
        await unlink(join(process.cwd(), existing.image));
      } catch {
        // File may already be missing; proceed silently
      }
    }

    return this.prisma.equipement.delete({ where: { id } });
  }

  async getStats(siteId: string) {
    const all = await this.prisma.equipement.findMany({ where: { siteId } });

    const byCategorie: Record<string, number> = {};
    const byStatut: Record<string, number> = {};

    for (const eq of all) {
      byCategorie[eq.categorie] = (byCategorie[eq.categorie] ?? 0) + 1;
      byStatut[eq.statut] = (byStatut[eq.statut] ?? 0) + 1;
    }

    return {
      total: all.length,
      byCategorie,
      byStatut,
    };
  }
}
