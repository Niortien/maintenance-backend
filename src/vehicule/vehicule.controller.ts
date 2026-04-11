import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculeService } from './vehicule.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Controller('vehicule')
export class VehiculeController {
  constructor(private readonly vehiculeService: VehiculeService) {}

  @Post()
  create(@Body() createVehiculeDto: CreateVehiculeDto) {
    return this.vehiculeService.create(createVehiculeDto);
  }

  @Get()
  findAll() {
    return this.vehiculeService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.vehiculeService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehiculeDto: UpdateVehiculeDto) {
    return this.vehiculeService.update(id, updateVehiculeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiculeService.remove(id);
  }
}
