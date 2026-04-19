import { Module } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { RapportController } from './rapport.controller';

@Module({
  controllers: [RapportController],
  providers: [RapportService],
})
export class RapportModule {}
