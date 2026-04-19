import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiculeModule } from './vehicule/vehicule.module';
import { AuthModule } from './auth/auth.module';
import { TechnicienModule } from './technicien/technicien.module';
import { InterventionModule } from './intervention/intervention.module';
import { SiteModule } from './site/site.module';
import { RapportModule } from './rapport/rapport.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VehiculeModule, AuthModule, TechnicienModule, InterventionModule, SiteModule, RapportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
