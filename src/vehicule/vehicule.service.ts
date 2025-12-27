import { PrismaService } from './../database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Injectable()
export class VehiculeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehiculeDto: CreateVehiculeDto) {
    return this.prisma.vehicule.create({
      data: {
        ...createVehiculeDto,
      },
    });
  }

  async findAll() {
    return this.prisma.vehicule.findMany();
  }

  async findOne(id: string) {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
    });

    if (!vehicule) {
      throw new NotFoundException(`Vehicule avec id ${id} introuvable`);
    }

    return vehicule;
  }

  async update(id: string, updateVehiculeDto: UpdateVehiculeDto) {
    // Vérifier si le véhicule existe avant d’update
    await this.findOne(id);

    return this.prisma.vehicule.update({
      where: { id },
      data: {
        ...updateVehiculeDto,
      },
    });
  }

 async remove(id: string) {
  // Vérifier si le véhicule existe avant delete
  await this.findOne(id);

  // Vérifier s'il y a des interventions liées
  const interventionsCount = await this.prisma.intervention.count({
    where: { vehiculeId: id },
  });

  if (interventionsCount > 0) {
    // Option 1 : supprimer toutes les interventions liées (cascade manuel)
    await this.prisma.intervention.deleteMany({
      where: { vehiculeId: id },
    });
    // Option 2 : ou lever une exception si tu ne veux pas supprimer les interventions
    // throw new Error('Impossible de supprimer ce véhicule : des interventions sont associées.');
  }

  // Supprimer le véhicule
  return this.prisma.vehicule.delete({
    where: { id },
  });
}

}
