import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TypeConsommable } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateRepartitionDto } from './dto/create-repartition.dto';
import { UpdateRepartitionDto } from './dto/update-repartition.dto';
import { QueryRepartitionAdminDto, QueryRepartitionDto } from './dto/query-repartition.dto';

function buildWhere(
  siteId: string | undefined,
  query: QueryRepartitionDto,
): Prisma.RepartitionWhereInput {
  return {
    ...(siteId ? { siteId } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.vehiculeId ? { vehiculeId: query.vehiculeId } : {}),
    ...(query.from || query.to
      ? {
          date: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };
}

@Injectable()
export class RepartitionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(siteId: string, responsableId: string, dto: CreateRepartitionDto) {
    if (dto.vehiculeId) {
      const vehicule = await this.prisma.vehicule.findUnique({ where: { id: dto.vehiculeId } });
      if (!vehicule) throw new NotFoundException(`Engin avec l'ID '${dto.vehiculeId}' introuvable`);
    }

    const montantAchat = dto.quantite * dto.prixUnitaireAchat;
    const montantVente = dto.quantite * dto.prixUnitaireVente;

    return this.prisma.repartition.create({
      data: {
        date: new Date(dto.date),
        type: dto.type,
        designation: dto.designation,
        quantite: dto.quantite,
        prixUnitaireAchat: dto.prixUnitaireAchat,
        prixUnitaireVente: dto.prixUnitaireVente,
        montantAchat,
        montantVente,
        benefice: montantVente - montantAchat,
        fournisseur: dto.fournisseur,
        siteId,
        responsableId,
        vehiculeId: dto.vehiculeId,
      },
      include: { vehicule: true },
    });
  }

  findAllBySite(siteId: string, query: QueryRepartitionDto) {
    return this.prisma.repartition.findMany({
      where: buildWhere(siteId, query),
      include: { vehicule: true },
      orderBy: { date: 'desc' },
    });
  }

  findAllAdmin(query: QueryRepartitionAdminDto) {
    return this.prisma.repartition.findMany({
      where: buildWhere(query.siteId, query),
      include: { vehicule: true, site: true, responsable: true },
      orderBy: { date: 'desc' },
    });
  }

  private async findOneRaw(id: string) {
    const repartition = await this.prisma.repartition.findUnique({ where: { id } });
    if (!repartition) throw new NotFoundException(`Répartition avec l'ID '${id}' introuvable`);
    return repartition;
  }

  async findOneBySite(id: string, siteId: string) {
    const repartition = await this.findOneRaw(id);
    if (repartition.siteId !== siteId) throw new ForbiddenException("Cette répartition n'appartient pas à votre site");
    return repartition;
  }

  async update(id: string, siteId: string, dto: UpdateRepartitionDto) {
    const existing = await this.findOneBySite(id, siteId);

    if (dto.vehiculeId) {
      const vehicule = await this.prisma.vehicule.findUnique({ where: { id: dto.vehiculeId } });
      if (!vehicule) throw new NotFoundException(`Engin avec l'ID '${dto.vehiculeId}' introuvable`);
    }

    const quantite = dto.quantite ?? existing.quantite;
    const prixUnitaireAchat = dto.prixUnitaireAchat ?? existing.prixUnitaireAchat;
    const prixUnitaireVente = dto.prixUnitaireVente ?? existing.prixUnitaireVente;
    const montantAchat = quantite * prixUnitaireAchat;
    const montantVente = quantite * prixUnitaireVente;

    return this.prisma.repartition.update({
      where: { id },
      data: {
        ...(dto.date ? { date: new Date(dto.date) } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.designation !== undefined ? { designation: dto.designation } : {}),
        ...(dto.fournisseur !== undefined ? { fournisseur: dto.fournisseur } : {}),
        ...(dto.vehiculeId !== undefined ? { vehiculeId: dto.vehiculeId } : {}),
        quantite,
        prixUnitaireAchat,
        prixUnitaireVente,
        montantAchat,
        montantVente,
        benefice: montantVente - montantAchat,
      },
      include: { vehicule: true },
    });
  }

  async remove(id: string, siteId: string) {
    await this.findOneBySite(id, siteId);
    return this.prisma.repartition.delete({ where: { id } });
  }

  private summarize(lignes: { type: TypeConsommable; quantite: number; montantAchat: number; montantVente: number; benefice: number }[]) {
    const parType = Object.values(TypeConsommable).map((type) => {
      const lignesType = lignes.filter((l) => l.type === type);
      return {
        type,
        nombreLignes: lignesType.length,
        quantiteTotale: lignesType.reduce((s, l) => s + l.quantite, 0),
        montantAchatTotal: lignesType.reduce((s, l) => s + l.montantAchat, 0),
        montantVenteTotal: lignesType.reduce((s, l) => s + l.montantVente, 0),
        beneficeTotal: lignesType.reduce((s, l) => s + l.benefice, 0),
      };
    });

    return {
      parType,
      global: {
        montantAchatTotal: lignes.reduce((s, l) => s + l.montantAchat, 0),
        montantVenteTotal: lignes.reduce((s, l) => s + l.montantVente, 0),
        beneficeTotal: lignes.reduce((s, l) => s + l.benefice, 0),
      },
    };
  }

  async summaryBySite(siteId: string, query: QueryRepartitionDto) {
    const lignes = await this.prisma.repartition.findMany({ where: buildWhere(siteId, query) });
    return this.summarize(lignes);
  }

  async summaryAdmin(query: QueryRepartitionAdminDto) {
    const lignes = await this.prisma.repartition.findMany({ where: buildWhere(query.siteId, query) });
    return this.summarize(lignes);
  }
}
