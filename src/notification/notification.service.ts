import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createForNewSituation(situationId: string, situationNom: string, siteNom: string) {
    return this.prisma.notification.create({
      data: {
        message: `Nouvelle situation signalée : "${situationNom}" sur le site ${siteNom}. Action requise.`,
        situation: { connect: { id: situationId } },
      },
    });
  }

  async findAll() {
    return this.prisma.notification.findMany({
      include: {
        situation: {
          select: {
            id: true,
            nom: true,
            statut: true,
            site: { select: { id: true, nom: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnread() {
    return this.prisma.notification.findMany({
      where: { lu: false },
      include: {
        situation: {
          select: {
            id: true,
            nom: true,
            statut: true,
            site: { select: { id: true, nom: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUnread() {
    const count = await this.prisma.notification.count({ where: { lu: false } });
    return { count };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
  }

  async markAllAsRead() {
    return this.prisma.notification.updateMany({
      where: { lu: false },
      data: { lu: true },
    });
  }
}
