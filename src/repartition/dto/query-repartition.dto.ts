import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TypeConsommable } from '@prisma/client';

export class QueryRepartitionDto {
  @ApiPropertyOptional({ enum: TypeConsommable })
  @IsOptional()
  @IsEnum(TypeConsommable)
  type?: TypeConsommable;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'Date de début (incluse)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'Date de fin (incluse)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: "ID de l'engin" })
  @IsOptional()
  @IsString()
  vehiculeId?: string;
}

export class QueryRepartitionAdminDto extends QueryRepartitionDto {
  @ApiPropertyOptional({ description: 'ID du site (toutes les répartitions si omis)' })
  @IsOptional()
  @IsString()
  siteId?: string;
}
