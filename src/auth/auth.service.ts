import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto, LoginDto, RegisterResponsableDto } from './dto/create-auth.dto';
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

  // ─── Changement de mot de passe ────────────────────────────────────────────
  async changePassword(responsableId: string, dto: ChangePasswordDto) {
    const responsable = await this.prisma.responsableSite.findUnique({ where: { id: responsableId } });
    if (!responsable) throw new NotFoundException('Responsable introuvable');

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
}
