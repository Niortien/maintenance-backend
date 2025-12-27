import { PartialType } from '@nestjs/swagger';
import { CreateTechnicienDto } from './create-technicien.dto';

export class UpdateTechnicienDto extends PartialType(CreateTechnicienDto) {}
