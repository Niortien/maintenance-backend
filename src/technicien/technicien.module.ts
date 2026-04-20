import { Module } from '@nestjs/common';
import { TechnicienService } from './technicien.service';
import { TechnicienController } from './technicien.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TechnicienController],
  providers: [TechnicienService],
})
export class TechnicienModule {}
