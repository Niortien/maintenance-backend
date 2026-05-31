import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  nom: string;
  prenom: string;
}
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto, LoginAdminDto, LoginDto, RegisterResponsableDto, UpdateResponsableDto } from './dto/create-auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const responsable = await this.prisma.responsableSite.findUnique({
      where: { email: dto.email },
      include: {
        site: {
          select: {
            id: true, nom: true, code: true, region: true, couleur: true,
          },
        },
      },
    });

    if (!responsable) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (!responsable.password) {
      throw new UnauthorizedException('Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.');
    }

    const passwordOk = await bcrypt.compare(dto.password, responsable.password);
    if (!passwordOk) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const payload: JwtPayload = {
      sub:    responsable.id,
      email:  responsable.email,
      siteId: responsable.siteId,
      role:   'RESPONSABLE',
    };

    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      responsable: {
        id:        responsable.id,
        nom:       responsable.nom,
        prenom:    responsable.prenom,
        email:     responsable.email,
        telephone: responsable.telephone,
        site:      responsable.site,
      },
    };
  }

  // ─── Register (admin seulement, ou premier setup) ────────────────────────
  async register(dto: RegisterResponsableDto) {
    // Vérifier que le site existe
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
    if (!site) throw new NotFoundException(`Site introuvable: ${dto.siteId}`);

    // Vérifier unicité email
    const existingEmail = await this.prisma.responsableSite.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Cet email est déjà utilisé');

    // Vérifier qu'un responsable n'est pas déjà assigné au site
    const existingSite = await this.prisma.responsableSite.findUnique({ where: { siteId: dto.siteId } });
    if (existingSite) throw new ConflictException('Ce site a déjà un responsable');

    const hash = await bcrypt.hash(dto.password, 10);

    const responsable = await this.prisma.responsableSite.create({
      data: {
        nom:       dto.nom,
        prenom:    dto.prenom,
        email:     dto.email,
        password:  hash,
        telephone: dto.telephone,
        siteId:    dto.siteId,
      },
      include: {
        site: { select: { id: true, nom: true, code: true, region: true, couleur: true } },
      },
    });

    const payload: JwtPayload = {
      sub:    responsable.id,
      email:  responsable.email,
      siteId: responsable.siteId,
      role:   'RESPONSABLE',
    };

    return {
      access_token: this.jwt.sign(payload),
      responsable: {
        id:        responsable.id,
        nom:       responsable.nom,
        prenom:    responsable.prenom,
        email:     responsable.email,
        telephone: responsable.telephone,
        site:      responsable.site,
      },
    };
  }

  // ─── Profil ────────────────────────────────────────────────────────────────
  async getProfile(responsableId: string) {
    const responsable = await this.prisma.responsableSite.findUnique({
      where: { id: responsableId },
      include: {
        site: {
          include: {
            vehicules:   { select: { id: true, nom: true, numero_de_plaque: true, statut: true, type: true } },
            techniciens: { select: { id: true, nom: true, prenom: true, statut: true, specialite: true } },
            _count:      { select: { rapports: true, vehicules: true, techniciens: true } },
          },
        },
      },
    });
    if (!responsable) throw new NotFoundException('Responsable introuvable');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...safe } = responsable;
    return safe;
  }

  // ─── Mise à jour du profil ────────────────────────────────────────────────
  async updateProfile(responsableId: string, dto: UpdateResponsableDto) {
    const updated = await this.prisma.responsableSite.update({
      where: { id: responsableId },
      data: {
        ...(dto.nom       !== undefined && { nom: dto.nom }),
        ...(dto.prenom    !== undefined && { prenom: dto.prenom }),
        ...(dto.telephone !== undefined && { telephone: dto.telephone }),
      },
      include: { site: { select: { id: true, nom: true, code: true, region: true, couleur: true } } },
    });
    const { password: _pwd, ...safe } = updated;
    return safe;
  }

  // ─── Suppression du compte ────────────────────────────────────────────────
  async deleteAccount(responsableId: string) {
    await this.prisma.responsableSite.delete({ where: { id: responsableId } });
    return { message: 'Compte supprimé avec succès' };
  }

  // ─── Changement de mot de passe ────────────────────────────────────────────
  async changePassword(responsableId: string, dto: ChangePasswordDto) {
    const responsable = await this.prisma.responsableSite.findUnique({ where: { id: responsableId } });
    if (!responsable) throw new NotFoundException('Responsable introuvable');

    if (!responsable.password) {
      throw new BadRequestException('Ce compte utilise la connexion Google et ne possède pas de mot de passe.');
    }

    const ok = await bcrypt.compare(dto.ancienMotDePasse, responsable.password);
    if (!ok) throw new BadRequestException('Ancien mot de passe incorrect');

    const newHash = await bcrypt.hash(dto.nouveauMotDePasse, 10);
    await this.prisma.responsableSite.update({
      where: { id: responsableId },
      data: { password: newHash },
    });

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  // ─── Stats du site du responsable ─────────────────────────────────────────
  async getSiteStats(siteId: string) {
    const [totalVehicules, vehiculesActifs, totalTechniciens, totalRapports, derniersRapports] =
      await Promise.all([
        this.prisma.vehicule.count({ where: { siteId } }),
        this.prisma.vehicule.count({ where: { siteId, statut: 'ACTIF' } }),
        this.prisma.technicien.count({ where: { siteId } }),
        this.prisma.rapportJournalier.count({ where: { siteId } }),
        this.prisma.rapportJournalier.findMany({
          where: { siteId },
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            lignes: {
              select: { statut: true },
            },
          },
        }),
      ]);

    return {
      totalVehicules,
      vehiculesActifs,
      vehiculesEnMaintenance: await this.prisma.vehicule.count({ where: { siteId, statut: 'EN_MAINTENANCE' } }),
      totalTechniciens,
      totalRapports,
      derniersRapports: derniersRapports.map((r) => ({
        id:    r.id,
        date:  r.date,
        total: r.lignes.length,
        ops:   r.lignes.filter((l) => l.statut === 'OPERATIONNEL').length,
        pannes: r.lignes.filter((l) => l.statut !== 'OPERATIONNEL').length,
      })),
    };
  }

  // ─── Login Admin ──────────────────────────────────────────────────────────
  async loginAdmin(dto: LoginAdminDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const ok = await bcrypt.compare(dto.password, admin.password);
    if (!ok) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const token = this.jwt.sign(
      { sub: String(admin.id), email: admin.email, role: 'ADMIN' },
    );

    return {
      access_token: token,
      admin: { id: admin.id, email: admin.email },
    };
  }

  // ─── Véhicules du site du responsable ────────────────────────────────────
  async getMyVehicules(siteId: string) {
    return this.prisma.vehicule.findMany({
      where: { siteId },
      orderBy: { nom: 'asc' },
    });
  }

  // ─── Techniciens du site (avec interventions du jour) ────────────────────
  async getMyTechniciens(siteId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.technicien.findMany({
      where: { siteId },
      include: {
        interventions: {
          where: { date: { gte: today, lt: tomorrow } },
          select: {
            id: true,
            description: true,
            designation: true,
            statut: true,
            vehicule: { select: { nom: true, numero_de_plaque: true } },
          },
        },
        _count: { select: { interventions: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  // ─── Interventions du site (filtrées par date) ────────────────────────────
  async getMyInterventions(siteId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.intervention.findMany({
      where: {
        date: { gte: targetDate, lt: nextDay },
        vehicule: { siteId },
      },
      include: {
        vehicule: { select: { id: true, nom: true, numero_de_plaque: true } },
        technicien: { select: { id: true, nom: true, prenom: true, specialite: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ─── Rapports du site du responsable ─────────────────────────────────────
  async getMyRapports(siteId: string) {
    return this.prisma.rapportJournalier.findMany({
      where: { siteId },
      include: { lignes: true },
      orderBy: { date: 'desc' },
    });
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  /** Called by GoogleStrategy.validate() — finds or links the responsable account */
  async validateGoogleUser(profile: GoogleUserProfile) {
    // 1. Try to find by googleId
    let responsable = await this.prisma.responsableSite.findUnique({
      where: { googleId: profile.googleId },
      include: { site: { select: { id: true, nom: true, code: true, region: true, couleur: true } } },
    });

    if (responsable) return responsable;

    // 2. Try to find by email and link the googleId
    responsable = await this.prisma.responsableSite.findUnique({
      where: { email: profile.email },
      include: { site: { select: { id: true, nom: true, code: true, region: true, couleur: true } } },
    });

    if (responsable) {
      responsable = await this.prisma.responsableSite.update({
        where: { id: responsable.id },
        data: { googleId: profile.googleId },
        include: { site: { select: { id: true, nom: true, code: true, region: true, couleur: true } } },
      });
      return responsable;
    }

    // 3. No account found — Google login is only available for pre-existing accounts
    throw new UnauthorizedException(
      'Aucun compte trouvé pour cet email Google. Contactez votre administrateur.',
    );
  }

  /** Generates a JWT for a responsable validated via Google */
  generateTokenForResponsable(responsable: { id: string; email: string; siteId: string }) {
    const payload: JwtPayload = {
      sub:    responsable.id,
      email:  responsable.email,
      siteId: responsable.siteId,
      role:   'RESPONSABLE',
    };
    return this.jwt.sign(payload);
  }
}
