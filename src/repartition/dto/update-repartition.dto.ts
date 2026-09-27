import { PartialType } from '@nestjs/swagger';
import { CreateRepartitionDto } from './create-repartition.dto';

export class UpdateRepartitionDto extends PartialType(CreateRepartitionDto) {}
