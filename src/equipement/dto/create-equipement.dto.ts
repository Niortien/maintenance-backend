import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategorieEquipement, Statut } from '@prisma/client';

export class CreateEquipementDto {
  @ApiProperty({
    example: 'T50',
    description: 'Nom de l\'équipement (les tasseurs doivent commencer par T)',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    enum: CategorieEquipement,
    example: CategorieEquipement.TASSEUR,
    description: 'Catégorie de l\'équipement',
  })
  @IsEnum(CategorieEquipement)
  categorie: CategorieEquipement;

  @ApiPropertyOptional({
    example: 'AB-123-CD',
    description:
      'Immatriculation (obligatoire pour les catégories BP et KIA)',
  })
  @IsString()
  @IsOptional()
  immatriculation?: string;

  @ApiPropertyOptional({
    enum: Statut,
    example: Statut.ACTIF,
    description: 'Statut de l\'équipement',
  })
  @IsEnum(Statut)
  @IsOptional()
  statut?: Statut;
}
