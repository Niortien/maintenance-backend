import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { VehiculeModule } from './vehicule/vehicule.module';
import { AuthModule } from './auth/auth.module';
import { TechnicienModule } from './technicien/technicien.module';
import { InterventionModule } from './intervention/intervention.module';
import { SiteModule } from './site/site.module';
import { RapportModule } from './rapport/rapport.module';
import { AdminModule } from './admin/admin.module';
import { EquipementModule } from './equipement/equipement.module';
import { SituationModule } from './situation/situation.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, VehiculeModule, AuthModule, TechnicienModule, InterventionModule, SiteModule, RapportModule, AdminModule, EquipementModule, SituationModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
