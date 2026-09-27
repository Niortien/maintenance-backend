import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeConsommable } from '@prisma/client';

export class CreateRepartitionDto {
  @ApiProperty({ example: '2026-09-15', description: 'Date de la répartition' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: TypeConsommable, example: TypeConsommable.HUILE_MOTEUR })
  @IsEnum(TypeConsommable)
  type!: TypeConsommable;

  @ApiPropertyOptional({ example: 'Pneu 315/80', description: 'Désignation (surtout utile pour les pneus)' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ example: 15, description: 'Quantité distribuée' })
  @IsNumber()
  @Min(0)
  quantite!: number;

  @ApiProperty({ example: 3100, description: "Prix unitaire d'achat (FCFA)" })
  @IsNumber()
  @Min(0)
  prixUnitaireAchat!: number;

  @ApiProperty({ example: 3720, description: 'Prix unitaire de vente (FCFA)' })
  @IsNumber()
  @Min(0)
  prixUnitaireVente!: number;

  @ApiPropertyOptional({ example: 'Total Sénégal' })
  @IsOptional()
  @IsString()
  fournisseur?: string;

  @ApiPropertyOptional({ example: '01J4K2XYZABC...', description: "ID de l'engin concerné" })
  @IsOptional()
  @IsString()
  vehiculeId?: string;
}
