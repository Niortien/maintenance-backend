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
import { JwtAdminGuard } from 'src/auth/jwt-admin.guard';
import { SituationService } from './situation.service';
import { CreateSituationDto } from './dto/create-situation.dto';
import { UpdateSituationDto } from './dto/update-situation.dto';

const imageStorage = diskStorage({
  destination: './uploads/situations',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const imageFilePipeRequired = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/, skipMagicNumbersValidation: true }),
  ],
  fileIsRequired: true,
});

const imageFilePipeOptional = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/, skipMagicNumbersValidation: true }),
  ],
  fileIsRequired: false,
});

@ApiTags('Situations — Rapports de panne équipements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('situation')
export class SituationController {
  constructor(private readonly situationService: SituationService) {}

  // GET /situation — situations du site du responsable
  @ApiOperation({ summary: 'Lister les situations du site' })
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.situationService.findAllBySite(user.siteId);
  }

  // GET /situation/:id — détail d'une situation
  @ApiOperation({ summary: 'Détail d\'une situation' })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.situationService.findOneBySite(id, user.siteId);
  }

  // POST /situation — créer une situation (multipart/form-data)
  @ApiOperation({ summary: 'Créer une situation de panne pour un équipement' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données de la situation + image obligatoire',
    schema: {
      type: 'object',
      required: ['equipementId', 'description', 'image'],
      properties: {
        equipementId: {
          type: 'string',
          description: 'ID de l\'équipement concerné',
        },
        description: {
          type: 'string',
          example:
            "Le système hydraulique ne marche pas.\nLe diagnostic montre que la plaquette des circuits d'électricité hydraulique est défaillante.",
        },
        besoinsLogistiques: {
          type: 'string',
          description:
            'Tableau JSON stringifié des besoins logistiques',
          example:
            '[{"designation":"Plaquette hydrauliques","quantite":1,"prixUnitaire":25000},{"designation":"Relais","quantite":2,"prixUnitaire":8000},{"designation":"Main d\'oeuvre de l\'electricien","quantite":1,"prixUnitaire":10000}]',
        },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  @Post()
  create(
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: CreateSituationDto,
    @UploadedFile(imageFilePipeRequired) image: Express.Multer.File,
  ) {
    return this.situationService.create(user.siteId, user.id, dto, image);
  }

  // PATCH /situation/:id — modifier une situation
  @ApiOperation({ summary: 'Modifier une situation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Champs à modifier + nouvelle image optionnelle',
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        besoinsLogistiques: {
          type: 'string',
          description: 'Remplace entièrement la liste des besoins (JSON stringifié)',
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
    @Body() dto: UpdateSituationDto,
    @UploadedFile(imageFilePipeOptional) image?: Express.Multer.File,
  ) {
    return this.situationService.update(id, user.siteId, dto, image);
  }

  // DELETE /situation/:id — supprimer une situation
  @ApiOperation({ summary: 'Supprimer une situation' })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.situationService.remove(id, user.siteId);
  }
}

// ─────────────────── Admin controller ───────────────────────────────────────

@ApiTags('Situations — Admin')
@ApiBearerAuth()
@UseGuards(JwtAdminGuard)
@Controller('admin/situations')
export class SituationAdminController {
  constructor(private readonly situationService: SituationService) {}

  @ApiOperation({ summary: 'Toutes les situations (admin)' })
  @Get()
  findAll() {
    return this.situationService.findAll();
  }
}
