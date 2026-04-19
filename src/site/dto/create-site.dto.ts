import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Yamoussoukro', description: 'Nom du site' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'LVS', description: 'Code unique du site' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Centre', description: 'Région du site' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: 'ID du technicien responsable du site' })
  @IsString()
  @IsOptional()
  responsableId?: string;
}
