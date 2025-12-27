import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutIntervention, Priorite } from '@prisma/client';
import { Transform } from 'class-transformer';
import { isValid, parse } from 'date-fns';

export class CreateInterventionDto {
  @ApiProperty({ example: '15/10/2023', description: 'Date de l’intervention' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    const parsed = parse(value, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed.toISOString() : value;
  })
  date: string;

  @ApiProperty({ example: 'Le moteur ne démarre pas', description: 'Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Le véhicule est en panne', description: 'Situation' })
  @IsNotEmpty()
  @IsString()
  situation: string;

  @ApiProperty({ example: 'Remplacement batterie', description: 'Désignation' })
  @IsNotEmpty()
  @IsString()
  designation: string;

  @ApiProperty({ example: 'MOYENNE', description: 'Priorité', enum: Priorite })
  @IsEnum(Priorite)
  priorite: Priorite;

  @ApiProperty({ example: 150.75, description: 'Coût de l’intervention' })
  @IsNotEmpty()
  @IsNumber()
  cout: number;

  @ApiProperty({ example: 2, description: 'Temps estimé (heures)' })
  @IsNotEmpty()
  @IsNumber()
  temps_estime_heures: number;

  @ApiProperty({ example: 1.5, description: 'Temps réel (heures)' })
  @IsOptional()
  @IsNumber()
  temps_reel_heures?: number;

  @ApiProperty({ example: 'Batterie, câbles', description: 'Pièces utilisées' })
  @IsOptional()
  @IsString()
  pieces_utilisees?: string;

  @ApiProperty({ example: 'Réparation réussie', description: 'Notes additionnelles' })
  @IsOptional()
  @IsString()
  notes_additionnelles?: string;

  @ApiProperty({ example: 'EN_COURS', description: 'Statut', enum: StatutIntervention })
  @IsEnum(StatutIntervention)
  statut: StatutIntervention;

  @ApiProperty({ example: 'vehicule-ulid-id', description: 'ID du véhicule' })
  @IsNotEmpty()
  @IsString()
  vehiculeId: string;

  @ApiProperty({ example: 'technicien-ulid-id', description: 'ID du technicien' })
  @IsNotEmpty()
  @IsString()
  technicienId: string;
}
