import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSiteDto: CreateSiteDto) {
    const existing = await this.prisma.site.findUnique({ where: { code: createSiteDto.code } });
    if (existing) throw new ConflictException(`Un site avec le code '${createSiteDto.code}' existe déjà`);

    if (createSiteDto.responsableId) {
      const tech = await this.prisma.technicien.findUnique({ where: { id: createSiteDto.responsableId } });
      if (!tech) throw new NotFoundException(`Technicien responsable introuvable`);
    }

    return this.prisma.site.create({
      data: {
        nom: createSiteDto.nom,
        code: createSiteDto.code,
        region: createSiteDto.region,
        ...(createSiteDto.responsableId ? { responsable: { connect: { id: createSiteDto.responsableId } } } : {}),
      },
      include: { responsable: true },
    });
  }

  async findAll() {
    return this.prisma.site.findMany({
      orderBy: { nom: 'asc' },
      include: {
        responsable: { select: { id: true, nom: true, prenom: true, telephone: true } },
        _count: { select: { vehicules: true, techniciens: true, rapports: true } },
      },
    });
  }

  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        responsable: true,
        rapports: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { vehicules: true, techniciens: true, rapports: true } },
      },
    });
    if (!site) throw new NotFoundException(`Site avec l'ID '${id}' introuvable`);
    return site;
  }

  async getDashboard(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        responsable: true,
        vehicules: { include: { interventions: { where: { statut: { in: ['EN_ATTENTE', 'EN_COURS'] } }, take: 1 } } },
        techniciens: true,
        rapports: {
          orderBy: { date: 'desc' },
          take: 5,
          include: { lignes: true },
        },
      },
    });
    if (!site) throw new NotFoundException(`Site avec l'ID '${id}' introuvable`);

    const vehiculesActifs = site.vehicules.filter((v) => v.statut === 'ACTIF').length;
    const vehiculesEnPanne = site.vehicules.filter((v) => v.statut === 'EN_MAINTENANCE').length;
    const techniciensActifs = site.techniciens.filter((t) => t.statut === 'ACTIF').length;

    return {
      site: { id: site.id, nom: site.nom, code: site.code, region: site.region },
      responsable: site.responsable,
      stats: {
        vehiculesTotal: site.vehicules.length,
        vehiculesActifs,
        vehiculesEnPanne,
        techniciensTotal: site.techniciens.length,
        techniciensActifs,
        rapportsTotal: site.rapports.length,
      },
      vehicules: site.vehicules,
      techniciens: site.techniciens,
      derniersRapports: site.rapports,
    };
  }

  async update(id: string, updateSiteDto: UpdateSiteDto) {
    await this.findOne(id);

    if (updateSiteDto.code) {
      const existing = await this.prisma.site.findUnique({ where: { code: updateSiteDto.code } });
      if (existing && existing.id !== id)
        throw new ConflictException(`Un site avec le code '${updateSiteDto.code}' existe déjà`);
    }

    if (updateSiteDto.responsableId) {
      const tech = await this.prisma.technicien.findUnique({ where: { id: updateSiteDto.responsableId } });
      if (!tech) throw new NotFoundException(`Technicien responsable introuvable`);
    }

    const { responsableId, ...rest } = updateSiteDto;

    return this.prisma.site.update({
      where: { id },
      data: {
        ...rest,
        ...(responsableId !== undefined
          ? responsableId
            ? { responsable: { connect: { id: responsableId } } }
            : { responsable: { disconnect: true } }
          : {}),
      },
      include: { responsable: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.site.delete({ where: { id } });
  }
}
