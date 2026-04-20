import { Module } from '@nestjs/common';
import { EquipementController } from './equipement.controller';
import { EquipementService } from './equipement.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EquipementController],
  providers: [EquipementService],
  exports: [EquipementService],
})
export class EquipementModule {}
