import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Specialite, Statut } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnicienDto {
  @ApiProperty({ example: 'Doe', description: 'Nom du technicien' })
  @IsNotEmpty()
  @IsString()
  nom: string;

  @ApiProperty({ example: 'John', description: 'Prénom du technicien' })
  @IsNotEmpty()
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email du technicien' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: '+2250707070707', description: 'Téléphone du technicien' })
  @IsNotEmpty()
  @IsString()
  telephone: string;

  @ApiProperty({ example: 'ACTIF', description: 'Statut du technicien', enum: Statut })
  @IsEnum(Statut)
  statut: Statut;

  @ApiProperty({ example: 'MECANIQUE_GENERALE', description: 'Spécialité du technicien', enum: Specialite })
  @IsNotEmpty()
  @IsEnum(Specialite)
  specialite: Specialite;

  @ApiProperty({ example: '01JXXXXXXXXXXXXXXXXXXXXXXXXX', description: 'ID du site auquel appartient le technicien' })
  @IsNotEmpty()
  @IsString()
  siteId: string;
}
