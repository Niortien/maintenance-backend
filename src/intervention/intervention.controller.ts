import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';

@Controller('intervention')
export class InterventionController {
  constructor(private readonly interventionService: InterventionService) {}

  @Post()
  create(@Body() createInterventionDto: CreateInterventionDto) {
    return this.interventionService.create(createInterventionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.interventionService.findAll(user.siteId);
  }

  @Get('statistics')
  getStatistics() {
    return this.interventionService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interventionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterventionDto: UpdateInterventionDto) {
    return this.interventionService.update(id, updateInterventionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interventionService.remove(id);
  }
}
