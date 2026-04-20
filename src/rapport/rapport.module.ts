import { Module } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { RapportController } from './rapport.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RapportController],
  providers: [RapportService],
})
export class RapportModule {}
