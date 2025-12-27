import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';

@Injectable()
export class TechnicienService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTechnicienDto: CreateTechnicienDto) {
    return this.prisma.technicien.create({
      data: createTechnicienDto,
    });
  }

  findAll() {
    return this.prisma.technicien.findMany({
      include: { interventions: true },
    });
  }

  findOne(id: string) {
    return this.prisma.technicien.findUnique({
      where: { id },
      include: { interventions: true },
    });
  }

  update(id: string, updateTechnicienDto: UpdateTechnicienDto) {
    return this.prisma.technicien.update({
      where: { id },
      data: updateTechnicienDto,
    });
  }

  remove(id: string) {
    return this.prisma.technicien.delete({
      where: { id },
    });
  }
}
