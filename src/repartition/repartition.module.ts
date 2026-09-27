import { Module } from '@nestjs/common';
import { RepartitionController, RepartitionAdminController } from './repartition.controller';
import { RepartitionService } from './repartition.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RepartitionController, RepartitionAdminController],
  providers: [RepartitionService],
  exports: [RepartitionService],
})
export class RepartitionModule {}
