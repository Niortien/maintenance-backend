import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { StatutTechnicien } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHistoriqueDto {
  @ApiProperty({
    example: 'EN_CONGE',
    enum: StatutTechnicien,
    description: 'Nouveau statut / type d\'événement',
  })
  @IsEnum(StatutTechnicien)
  statut: StatutTechnicien;

  @ApiProperty({ example: '2026-06-01', description: 'Date de début de l\'événement' })
  @IsDateString()
  dateDebut: string;

  @ApiProperty({ example: '2026-06-15', description: 'Date de fin (optionnelle si encore en cours)', required: false })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty({ example: 'Abidjan, Zone 4', description: 'Lieu (obligatoire si EN_MISSION)', required: false })
  @IsOptional()
  @IsString()
  lieu?: string;

  @ApiProperty({ example: 'Congé annuel', description: 'Notes / motif', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CloturerHistoriqueDto {
  @ApiProperty({ example: '2026-06-15', description: 'Date de fin (retour)' })
  @IsDateString()
  dateFin: string;

  @ApiProperty({ example: 'Retour effectif', description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
