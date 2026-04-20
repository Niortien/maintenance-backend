import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VehiculeService } from './vehicule.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';

@Controller('vehicule')
export class VehiculeController {
  constructor(private readonly vehiculeService: VehiculeService) {}

  @Post()
  create(@Body() createVehiculeDto: CreateVehiculeDto) {
    return this.vehiculeService.create(createVehiculeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.vehiculeService.findAll(user.siteId);
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
