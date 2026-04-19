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

    return this.prisma.site.create({ data: createSiteDto });
  }

  async findAll() {
    return this.prisma.site.findMany({ orderBy: { nom: 'asc' } });
  }

  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { rapports: { orderBy: { date: 'desc' }, take: 10 } },
    });
    if (!site) throw new NotFoundException(`Site avec l'ID '${id}' introuvable`);
    return site;
  }

  async update(id: string, updateSiteDto: UpdateSiteDto) {
    await this.findOne(id);

    if (updateSiteDto.code) {
      const existing = await this.prisma.site.findUnique({ where: { code: updateSiteDto.code } });
      if (existing && existing.id !== id)
        throw new ConflictException(`Un site avec le code '${updateSiteDto.code}' existe déjà`);
    }

    return this.prisma.site.update({ where: { id }, data: updateSiteDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.site.delete({ where: { id } });
  }
}
