import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TechnicienService } from './technicien.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';

@Controller('technicien')
export class TechnicienController {
  constructor(private readonly technicienService: TechnicienService) {}

  @Post()
  create(@Body() createTechnicienDto: CreateTechnicienDto) {
    return this.technicienService.create(createTechnicienDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.technicienService.findAll(user.siteId);
  }

  @Get('statistics')
  getStatistics() {
    return this.technicienService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicienService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTechnicienDto: UpdateTechnicienDto) {
    return this.technicienService.update(id, updateTechnicienDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicienService.remove(id);
  }
}
