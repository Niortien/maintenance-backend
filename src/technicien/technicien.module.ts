import { Module } from '@nestjs/common';
import { TechnicienService } from './technicien.service';
import { TechnicienController } from './technicien.controller';

@Module({
  controllers: [TechnicienController],
  providers: [TechnicienService],
})
export class TechnicienModule {}
