import { PartialType } from '@nestjs/swagger';
import { CreateSituationDto } from './create-situation.dto';

export class UpdateSituationDto extends PartialType(CreateSituationDto) {}
