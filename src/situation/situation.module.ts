import { Module } from '@nestjs/common';
import { SituationController, SituationAdminController } from './situation.controller';
import { SituationService } from './situation.service';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [SituationController, SituationAdminController],
  providers: [SituationService],
  exports: [SituationService],
})
export class SituationModule {}
