import { Injectable, NotFoundException } from '@nestjs/common';
import { CategorieVehicule, StatutVehiculeRapport } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateLigneRapportDto } from './dto/create-ligne-rapport.dto';
import { CreateRapportDto } from './dto/create-rapport.dto';
import { UpdateRapportDto } from './dto/update-rapport.dto';

@Injectable()
export class RapportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRapportDto: CreateRapportDto) {
    const site = await this.prisma.site.findUnique({ where: { id: createRapportDto.siteId } });
    if (!site) throw new NotFoundException(`Site avec l'ID '${createRapportDto.siteId}' introuvable`);

    return this.prisma.rapportJournalier.create({
      data: {
        date: new Date(createRapportDto.date),
        siteId: createRapportDto.siteId,
        lignes: createRapportDto.lignes
          ? {
              create: createRapportDto.lignes.map((l) => ({
                codeVehicule: l.codeVehicule,
                immatriculation: l.immatriculation,
                categorie: l.categorie,
                statut: l.statut,
                typesPannes: l.typesPannes ?? [],
                description: l.description,
              })),
            }
          : undefined,
      },
      include: { site: true, lignes: true },
    });
  }

  async findAll(siteId?: string, date?: string) {
    return this.prisma.rapportJournalier.findMany({
      where: {
        ...(siteId ? { siteId } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
      include: { site: true, lignes: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const rapport = await this.prisma.rapportJournalier.findUnique({
      where: { id },
      include: { site: true, lignes: true },
    });
    if (!rapport) throw new NotFoundException(`Rapport avec l'ID '${id}' introuvable`);
    return rapport;
  }

  async update(id: string, updateRapportDto: UpdateRapportDto) {
    await this.findOne(id);

    if (updateRapportDto.siteId) {
      const site = await this.prisma.site.findUnique({ where: { id: updateRapportDto.siteId } });
      if (!site) throw new NotFoundException(`Site avec l'ID '${updateRapportDto.siteId}' introuvable`);
    }

    return this.prisma.rapportJournalier.update({
      where: { id },
      data: {
        ...(updateRapportDto.date ? { date: new Date(updateRapportDto.date) } : {}),
        ...(updateRapportDto.siteId ? { siteId: updateRapportDto.siteId } : {}),
      },
      include: { site: true, lignes: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rapportJournalier.delete({ where: { id } });
  }

  // --- Gestion des lignes ---

  async addLigne(rapportId: string, dto: CreateLigneRapportDto) {
    await this.findOne(rapportId);
    return this.prisma.ligneRapport.create({
      data: {
        rapportId,
        codeVehicule: dto.codeVehicule,
        immatriculation: dto.immatriculation,
        categorie: dto.categorie,
        statut: dto.statut,
        typesPannes: dto.typesPannes ?? [],
        description: dto.description,
      },
    });
  }

  async updateLigne(ligneId: string, dto: Partial<CreateLigneRapportDto>) {
    const ligne = await this.prisma.ligneRapport.findUnique({ where: { id: ligneId } });
    if (!ligne) throw new NotFoundException(`Ligne avec l'ID '${ligneId}' introuvable`);

    return this.prisma.ligneRapport.update({
      where: { id: ligneId },
      data: {
        ...(dto.codeVehicule !== undefined ? { codeVehicule: dto.codeVehicule } : {}),
        ...(dto.immatriculation !== undefined ? { immatriculation: dto.immatriculation } : {}),
        ...(dto.categorie !== undefined ? { categorie: dto.categorie } : {}),
        ...(dto.statut !== undefined ? { statut: dto.statut } : {}),
        ...(dto.typesPannes !== undefined ? { typesPannes: dto.typesPannes } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });
  }

  async removeLigne(ligneId: string) {
    const ligne = await this.prisma.ligneRapport.findUnique({ where: { id: ligneId } });
    if (!ligne) throw new NotFoundException(`Ligne avec l'ID '${ligneId}' introuvable`);
    return this.prisma.ligneRapport.delete({ where: { id: ligneId } });
  }

  // --- Récapitulatif ---

  async getRecap(rapportId: string) {
    const rapport = await this.findOne(rapportId);

    const categories = Object.values(CategorieVehicule);
    const recap = categories
      .map((categorie) => {
        const lignesCategorie = rapport.lignes.filter((l) => l.categorie === categorie);
        if (lignesCategorie.length === 0) return null;

        const operationnels = lignesCategorie.filter((l) => l.statut === StatutVehiculeRapport.OPERATIONNEL).length;
        return {
          categorie,
          operationnels,
          total: lignesCategorie.length,
          resume: `${operationnels}/${lignesCategorie.length}`,
        };
      })
      .filter(Boolean);

    const pannes = rapport.lignes.filter((l) => l.statut !== StatutVehiculeRapport.OPERATIONNEL);

    return {
      date: rapport.date,
      site: rapport.site,
      recap,
      pannes: pannes.map((p) => ({
        codeVehicule: p.codeVehicule,
        immatriculation: p.immatriculation,
        categorie: p.categorie,
        statut: p.statut,
        typesPannes: p.typesPannes,
        description: p.description,
      })),
    };
  }

  async getStatistics() {
    const totalRapports = await this.prisma.rapportJournalier.count();
    const totalLignes = await this.prisma.ligneRapport.count();
    const operationnels = await this.prisma.ligneRapport.count({
      where: { statut: StatutVehiculeRapport.OPERATIONNEL },
    });
    const enPanne = await this.prisma.ligneRapport.count({
      where: { statut: StatutVehiculeRapport.EN_PANNE },
    });
    const accidentes = await this.prisma.ligneRapport.count({
      where: { statut: StatutVehiculeRapport.ACCIDENTE },
    });

    return { totalRapports, totalLignes, operationnels, enPanne, accidentes };
  }
}
