import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtAdminGuard } from 'src/auth/jwt-admin.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';
import { RepartitionService } from './repartition.service';
import { CreateRepartitionDto } from './dto/create-repartition.dto';
import { UpdateRepartitionDto } from './dto/update-repartition.dto';
import { QueryRepartitionAdminDto, QueryRepartitionDto } from './dto/query-repartition.dto';

@ApiTags('Répartitions — Huile / Pneus / Batteries (site)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('repartitions')
export class RepartitionController {
  constructor(private readonly repartitionService: RepartitionService) {}

  @ApiOperation({ summary: 'Lister les répartitions du site (filtrable par type / période / engin)' })
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite, @Query() query: QueryRepartitionDto) {
    return this.repartitionService.findAllBySite(user.siteId, query);
  }

  @ApiOperation({ summary: 'Récapitulatif (totaux par type) — sert de base au PDF' })
  @Get('summary')
  summary(@CurrentResponsable() user: ResponsableWithSite, @Query() query: QueryRepartitionDto) {
    return this.repartitionService.summaryBySite(user.siteId, query);
  }

  @ApiOperation({ summary: 'Enregistrer une répartition journalière (huile moteur, huile vérin, pneu ou batterie)' })
  @Post()
  create(@CurrentResponsable() user: ResponsableWithSite, @Body() dto: CreateRepartitionDto) {
    return this.repartitionService.create(user.siteId, user.id, dto);
  }

  @ApiOperation({ summary: 'Modifier une répartition' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: UpdateRepartitionDto,
  ) {
    return this.repartitionService.update(id, user.siteId, dto);
  }

  @ApiOperation({ summary: 'Supprimer une répartition' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentResponsable() user: ResponsableWithSite) {
    return this.repartitionService.remove(id, user.siteId);
  }
}

// ─────────────────────────── Admin controller ───────────────────────────────

@ApiTags('Répartitions — Admin')
@ApiBearerAuth()
@UseGuards(JwtAdminGuard)
@Controller('admin/repartitions')
export class RepartitionAdminController {
  constructor(private readonly repartitionService: RepartitionService) {}

  @ApiOperation({ summary: 'Lister les répartitions, tous sites confondus (filtrable par site / type / période)' })
  @Get()
  findAll(@Query() query: QueryRepartitionAdminDto) {
    return this.repartitionService.findAllAdmin(query);
  }

  @ApiOperation({ summary: 'Récapitulatif global (filtrable par site / type / période)' })
  @Get('summary')
  summary(@Query() query: QueryRepartitionAdminDto) {
    return this.repartitionService.summaryAdmin(query);
  }
}
