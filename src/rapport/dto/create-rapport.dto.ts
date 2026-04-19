import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateLigneRapportDto } from './create-ligne-rapport.dto';

export class CreateRapportDto {
  @ApiProperty({ example: '2026-04-13', description: 'Date du rapport (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'site-id-ulid', description: 'ID du site concerné' })
  @IsString()
  @IsNotEmpty()
  siteId: string;

  @ApiPropertyOptional({
    type: [CreateLigneRapportDto],
    description: 'Liste des véhicules avec leur statut',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLigneRapportDto)
  @IsOptional()
  lignes?: CreateLigneRapportDto[];
}
