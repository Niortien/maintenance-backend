import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBesoinLogistiqueDto {
  @ApiProperty({ example: 'Plaquette hydrauliques', description: 'Désignation du besoin' })
  @IsString()
  @IsNotEmpty()
  designation!: string;

  @ApiProperty({ example: 1, description: 'Quantité' })
  @IsNumber()
  @Min(0)
  quantite!: number;

  @ApiProperty({ example: 25000, description: 'Prix unitaire (en FCFA)' })
  @IsNumber()
  @Min(0)
  prixUnitaire!: number;
}

export class CreateSituationDto {
  @ApiProperty({
    example: '01J4K2XYZABC...',
    description: "ID de l'équipement concerné — le nom de la situation sera déduit automatiquement (ex: SITUATION T115)",
  })
  @IsString()
  @IsNotEmpty()
  equipementId!: string;

  @ApiProperty({
    example:
      "Le système hydraulique ne marche pas.\nLe diagnostic montre que la plaquette des circuits d'électricité hydraulique est défaillante.",
    description: 'Description du problème et diagnostic',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    type: 'string',
    description:
      'Liste des besoins logistiques (JSON stringifié) — ex: [{"designation":"Plaquette hydrauliques","quantite":1,"prixUnitaire":25000}]',
    example: '[{"designation":"Plaquette hydrauliques","quantite":1,"prixUnitaire":25000},{"designation":"Relais","quantite":2,"prixUnitaire":8000}]',
  })
  @IsOptional()
  @IsString()
  besoinsLogistiques?: string; // JSON string (multipart constraint)
}
