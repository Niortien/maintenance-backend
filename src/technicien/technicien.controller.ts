import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { TechnicienService } from './technicien.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { CreateHistoriqueDto, CloturerHistoriqueDto } from './dto/create-historique.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentResponsable, ResponsableWithSite } from 'src/auth/current-responsable.decorator';

const photoStorage = diskStorage({
  destination: './uploads/techniciens',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const photoFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/, skipMagicNumbersValidation: true }),
  ],
  fileIsRequired: false,
});

@ApiTags('Techniciens')
@Controller('technicien')
export class TechnicienController {
  constructor(private readonly technicienService: TechnicienService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom', 'prenom', 'email', 'telephone', 'specialite', 'siteId'],
      properties: {
        nom: { type: 'string' },
        prenom: { type: 'string' },
        email: { type: 'string' },
        telephone: { type: 'string' },
        statut: { type: 'string', enum: ['ACTIF', 'EN_MAINTENANCE', 'INACTIF', 'EN_MISSION', 'EN_CONGE', 'MALADE'] },
        specialite: { type: 'string', enum: ['MECANIQUE_GENERALE', 'ELECTRICITE_AUTOMOBILE', 'PNEUMATIQUE', 'DIAGNOSTIC_ELECTRONIQUE', 'SYSTEME_FREINAGE', 'CLIMATISATION', 'TRANSMISSION', 'HYDRAULIQUE', 'CARROSSERIE', 'PEINTURE'] },
        siteId: { type: 'string' },
        lieuMission: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  @Post()
  create(
    @Body() createTechnicienDto: CreateTechnicienDto,
    @UploadedFile(photoFilePipe) photo?: Express.Multer.File,
  ) {
    return this.technicienService.create(createTechnicienDto, photo);
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

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string' },
        prenom: { type: 'string' },
        email: { type: 'string' },
        telephone: { type: 'string' },
        statut: { type: 'string', enum: ['ACTIF', 'EN_MAINTENANCE', 'INACTIF', 'EN_MISSION', 'EN_CONGE', 'MALADE'] },
        specialite: { type: 'string', enum: ['MECANIQUE_GENERALE', 'ELECTRICITE_AUTOMOBILE', 'PNEUMATIQUE', 'DIAGNOSTIC_ELECTRONIQUE', 'SYSTEME_FREINAGE', 'CLIMATISATION', 'TRANSMISSION', 'HYDRAULIQUE', 'CARROSSERIE', 'PEINTURE'] },
        siteId: { type: 'string' },
        lieuMission: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo', { storage: photoStorage }))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechnicienDto: UpdateTechnicienDto,
    @UploadedFile(photoFilePipe) photo?: Express.Multer.File,
  ) {
    return this.technicienService.update(id, updateTechnicienDto, photo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicienService.remove(id);
  }

  // ─── HISTORIQUE ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get(':id/details')
  getTechnicienDetails(@Param('id') id: string) {
    return this.technicienService.getTechnicienDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/historique')
  getHistorique(@Param('id') id: string) {
    return this.technicienService.getHistorique(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/historique')
  addHistorique(
    @Param('id') id: string,
    @Body() dto: CreateHistoriqueDto,
  ) {
    return this.technicienService.addHistorique(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/historique/:historiqueId/cloturer')
  cloturerHistorique(
    @Param('id') id: string,
    @Param('historiqueId') historiqueId: string,
    @Body() dto: CloturerHistoriqueDto,
  ) {
    return this.technicienService.cloturerHistorique(id, historiqueId, dto);
  }
}
