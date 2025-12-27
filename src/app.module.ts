import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiculeModule } from './vehicule/vehicule.module';
import { AuthModule } from './auth/auth.module';
import { TechnicienModule } from './technicien/technicien.module';
import { InterventionModule } from './intervention/intervention.module';

@Module({
  imports: [VehiculeModule, AuthModule, TechnicienModule, InterventionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
