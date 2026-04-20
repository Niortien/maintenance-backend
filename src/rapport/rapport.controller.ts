import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateLigneRapportDto } from './dto/create-ligne-rapport.dto';
import { CreateRapportDto } from './dto/create-rapport.dto';
import { UpdateRapportDto } from './dto/update-rapport.dto';
import { RapportService } from './rapport.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';

@ApiTags('rapports')
@Controller('rapports')
export class RapportController {
  constructor(private readonly rapportService: RapportService) {}

  @Post()
  create(@Body() createRapportDto: CreateRapportDto) {
    return this.rapportService.create(createRapportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'date', required: false, description: 'Date ISO (ex: 2026-04-13)' })
  findAll(
    @CurrentResponsable() user: ResponsableWithSite,
    @Query('date') date?: string,
  ) {
    return this.rapportService.findAll(user.siteId, date);
  }

  @Get('statistics')
  getStatistics() {
    return this.rapportService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rapportService.findOne(id);
  }

  @Get(':id/recap')
  getRecap(@Param('id') id: string) {
    return this.rapportService.getRecap(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRapportDto: UpdateRapportDto) {
    return this.rapportService.update(id, updateRapportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rapportService.remove(id);
  }

  // --- Gestion des lignes de rapport ---

  @Post(':id/lignes')
  addLigne(@Param('id') id: string, @Body() createLigneDto: CreateLigneRapportDto) {
    return this.rapportService.addLigne(id, createLigneDto);
  }

  @Patch('lignes/:ligneId')
  updateLigne(@Param('ligneId') ligneId: string, @Body() dto: CreateLigneRapportDto) {
    return this.rapportService.updateLigne(ligneId, dto);
  }

  @Delete('lignes/:ligneId')
  removeLigne(@Param('ligneId') ligneId: string) {
    return this.rapportService.removeLigne(ligneId);
  }
}
