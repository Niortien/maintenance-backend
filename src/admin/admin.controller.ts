import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { RegisterResponsableDto } from '../auth/dto/create-auth.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/sites
  @ApiOperation({ summary: 'Tous les sites avec statistiques' })
  @Get('sites')
  getAllSites() {
    return this.adminService.getAllSites();
  }

  // GET /admin/sites/:siteId/rapports?date=YYYY-MM-DD
  @ApiOperation({ summary: 'Rapports d\'un site, filtrables par date' })
  @Get('sites/:siteId/rapports')
  getSiteRapports(
    @Param('siteId') siteId: string,
    @Query('date') date?: string,
  ) {
    return this.adminService.getSiteRapports(siteId, date);
  }

  // GET /admin/rapports/:id
  @ApiOperation({ summary: 'Détail d\'un rapport' })
  @Get('rapports/:id')
  getRapportById(@Param('id') id: string) {
    return this.adminService.getRapportById(id);
  }

  // GET /admin/sites/:siteId/vehicules
  @ApiOperation({ summary: 'Véhicules d\'un site' })
  @Get('sites/:siteId/vehicules')
  getSiteVehicules(@Param('siteId') siteId: string) {
    return this.adminService.getSiteVehicules(siteId);
  }

  // GET /admin/sites/:siteId/techniciens
  @ApiOperation({ summary: 'Techniciens d\'un site' })
  @Get('sites/:siteId/techniciens')
  getSiteTechniciens(@Param('siteId') siteId: string) {
    return this.adminService.getSiteTechniciens(siteId);
  }

  // GET /admin/stats/cards?siteId=&dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD
  @ApiOperation({ summary: 'Statistiques globales pour les cards (avec filtres)' })
  @Get('stats/cards')
  getStatsCards(
    @Query('siteId')     siteId?:     string,
    @Query('dateDebut')  dateDebut?:  string,
    @Query('dateFin')    dateFin?:    string,
  ) {
    return this.adminService.getStatsCards(siteId, dateDebut, dateFin);
  }

  // GET /admin/stats/graph?siteId=&dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD
  @ApiOperation({ summary: 'Données pour graphiques (évolution + répartition par site)' })
  @Get('stats/graph')
  getGraphData(
    @Query('siteId')     siteId?:     string,
    @Query('dateDebut')  dateDebut?:  string,
    @Query('dateFin')    dateFin?:    string,
  ) {
    return this.adminService.getGraphData(siteId, dateDebut, dateFin);
  }

  // GET /admin/responsables
  @ApiOperation({ summary: 'Liste tous les responsables de site' })
  @Get('responsables')
  getResponsables() {
    return this.adminService.getResponsables();
  }

  // POST /admin/responsables
  @ApiOperation({ summary: 'Créer un responsable de site' })
  @Post('responsables')
  createResponsable(@Body() dto: RegisterResponsableDto) {
    return this.adminService.createResponsable(dto);
  }

  // PATCH /admin/responsables/:id
  @ApiOperation({ summary: 'Modifier un responsable de site' })
  @Patch('responsables/:id')
  updateResponsable(
    @Param('id') id: string,
    @Body() dto: { nom?: string; prenom?: string; telephone?: string },
  ) {
    return this.adminService.updateResponsable(id, dto);
  }

  // DELETE /admin/responsables/:id
  @ApiOperation({ summary: 'Supprimer un responsable de site' })
  @Delete('responsables/:id')
  deleteResponsable(@Param('id') id: string) {
    return this.adminService.deleteResponsable(id);
  }
}
