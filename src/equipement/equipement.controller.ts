import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Optional,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  CurrentResponsable,
  ResponsableWithSite,
} from 'src/auth/current-responsable.decorator';
import { EquipementService } from './equipement.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';

const imageStorage = diskStorage({
  destination: './uploads/equipements',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const imageFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
  ],
  fileIsRequired: false,
});

@ApiTags('Équipements — Gestion du stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipement')
export class EquipementController {
  constructor(private readonly equipementService: EquipementService) {}

  // GET /equipement — liste des équipements du site du responsable
  @ApiOperation({ summary: 'Lister les équipements du site' })
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.equipementService.findAllBySite(user.siteId);
  }

  // GET /equipement/stats — statistiques du stock
  @ApiOperation({ summary: 'Statistiques du stock d\'équipements' })
  @Get('stats')
  getStats(@CurrentResponsable() user: ResponsableWithSite) {
    return this.equipementService.getStats(user.siteId);
  }

  // GET /equipement/:id — détail d'un équipement
  @ApiOperation({ summary: 'Détail d\'un équipement' })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.equipementService.findOneBySite(id, user.siteId);
  }

  // POST /equipement — créer un équipement (multipart/form-data)
  @ApiOperation({ summary: 'Ajouter un équipement au stock' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données de l\'équipement + image optionnelle',
    schema: {
      type: 'object',
      required: ['nom', 'categorie'],
      properties: {
        nom: { type: 'string', example: 'T50' },
        categorie: {
          type: 'string',
          enum: ['TASSEUR', 'TRACTEUR', 'AMPLIROLL', 'MOTO_TRICYCLE', 'BP', 'KIA', 'VOITURETTE'],
        },
        immatriculation: { type: 'string', example: 'AB-123-CD' },
        statut: {
          type: 'string',
          enum: ['ACTIF', 'EN_MAINTENANCE', 'INACTIF'],
        },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  @Post()
  create(
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: CreateEquipementDto,
    @UploadedFile(imageFilePipe) image?: Express.Multer.File,
  ) {
    return this.equipementService.create(user.siteId, dto, image);
  }

  // PATCH /equipement/:id — modifier un équipement
  @ApiOperation({ summary: 'Modifier un équipement' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Champs à modifier + image optionnelle',
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string' },
        categorie: {
          type: 'string',
          enum: ['TASSEUR', 'TRACTEUR', 'AMPLIROLL', 'MOTO_TRICYCLE', 'BP', 'KIA', 'VOITURETTE'],
        },
        immatriculation: { type: 'string' },
        statut: {
          type: 'string',
          enum: ['ACTIF', 'EN_MAINTENANCE', 'INACTIF'],
        },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: UpdateEquipementDto,
    @UploadedFile(imageFilePipe) image?: Express.Multer.File,
  ) {
    return this.equipementService.update(id, user.siteId, dto, image);
  }

  // DELETE /equipement/:id — supprimer un équipement
  @ApiOperation({ summary: 'Supprimer un équipement du stock' })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.equipementService.remove(id, user.siteId);
  }
}
