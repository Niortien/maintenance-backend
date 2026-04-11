import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TechnicienService } from './technicien.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';

@Controller('technicien')
export class TechnicienController {
  constructor(private readonly technicienService: TechnicienService) {}

  @Post()
  create(@Body() createTechnicienDto: CreateTechnicienDto) {
    return this.technicienService.create(createTechnicienDto);
  }

  @Get()
  findAll() {
    return this.technicienService.findAll();
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
