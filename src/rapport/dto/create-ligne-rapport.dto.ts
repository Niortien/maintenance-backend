import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategorieVehicule, StatutVehiculeRapport, TypePanne } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLigneRapportDto {
  @ApiProperty({ example: 'T58', description: 'Code interne du véhicule (ex: T58, A31, BP06)' })
  @IsString()
  @IsNotEmpty()
  codeVehicule: string;

  @ApiPropertyOptional({ example: '5985KT', description: "Numéro d'immatriculation" })
  @IsString()
  @IsOptional()
  immatriculation?: string;

  @ApiProperty({ enum: CategorieVehicule, example: CategorieVehicule.TASSEUR })
  @IsEnum(CategorieVehicule)
  categorie: CategorieVehicule;

  @ApiProperty({ enum: StatutVehiculeRapport, example: StatutVehiculeRapport.OPERATIONNEL })
  @IsEnum(StatutVehiculeRapport)
  statut: StatutVehiculeRapport;

  @ApiPropertyOptional({
    enum: TypePanne,
    isArray: true,
    example: [TypePanne.MECANIQUE],
    description: 'Types de pannes (si en panne)',
  })
  @IsArray()
  @IsEnum(TypePanne, { each: true })
  @IsOptional()
  typesPannes?: TypePanne[];

  @ApiPropertyOptional({ example: 'Problème de pompe à injection', description: 'Description de la panne' })
  @IsString()
  @IsOptional()
  description?: string;
}
