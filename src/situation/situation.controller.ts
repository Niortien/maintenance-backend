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
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { UpdateStatutSituationDto } from './dto/update-statut-situation.dto';

const imageStorage = diskStorage({
  destination: './uploads/situations',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const imageFilePipeRequired = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
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

@ApiTags('Situations — Rapports de panne equipements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('situation')
export class SituationController {
  constructor(private readonly situationService: SituationService) {}

  @ApiOperation({ summary: 'Lister les situations du site' })
  @Get()
  findAll(@CurrentResponsable() user: ResponsableWithSite) {
    return this.situationService.findAllBySite(user.siteId);
  }

  @ApiOperation({ summary: "Detail d'une situation" })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.situationService.findOneBySite(id, user.siteId);
  }

  @ApiOperation({ summary: 'Creer une situation de panne (plusieurs images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['equipementId', 'description', 'image'],
      properties: {
        equipementId: { type: 'string' },
        description: { type: 'string' },
        besoinsLogistiques: { type: 'string', description: 'JSON stringifie' },
        image: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Une ou plusieurs images (meme champ repete)' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('image', 10, { storage: imageStorage }))
  @Post()
  create(
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: CreateSituationDto,
    @UploadedFiles(imageFilePipeRequired) images: Express.Multer.File[],
  ) {
    return this.situationService.create(user.siteId, user.id, dto, images);
  }

  @ApiOperation({ summary: 'Modifier une situation (ajoute les nouvelles images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        besoinsLogistiques: { type: 'string', description: 'JSON stringifie — remplace les besoins' },
        image: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Nouvelles images a ajouter (meme champ repete)' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('image', 10, { storage: imageStorage }))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: UpdateSituationDto,
    @UploadedFiles(imageFilePipeOptional) images?: Express.Multer.File[],
  ) {
    return this.situationService.update(id, user.siteId, dto, images);
  }

  @ApiOperation({ summary: "Changer le statut d'une situation (EN_COURS ou TERMINEE)" })
  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
    @Body() dto: UpdateStatutSituationDto,
  ) {
    return this.situationService.updateStatutByResponsable(id, user.siteId, dto);
  }

  @ApiOperation({ summary: "Supprimer une image d'une situation" })
  @Delete(':id/images/:imageId')
  removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.situationService.removeImage(id, imageId, user.siteId);
  }

  @ApiOperation({ summary: 'Supprimer une situation' })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentResponsable() user: ResponsableWithSite,
  ) {
    return this.situationService.remove(id, user.siteId);
  }
}

// ─────────────────────────── Admin controller ───────────────────────────────

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

  @ApiOperation({ summary: "Detail d'une situation (admin)" })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.situationService.findOneAdmin(id);
  }

  @ApiOperation({ summary: "Changer le statut d'une situation (admin — tous statuts)" })
  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() dto: UpdateStatutSituationDto,
  ) {
    return this.situationService.updateStatutByAdmin(id, dto);
  }
}
