import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';

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
}
