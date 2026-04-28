import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutSituation } from '@prisma/client';

export class UpdateStatutSituationDto {
  @ApiProperty({
    enum: StatutSituation,
    description: 'Nouveau statut de la situation',
    example: 'EN_COURS',
  })
  @IsEnum(StatutSituation)
  statut!: StatutSituation;
}
