import { PrismaClient, CategorieVehicule, StatutVehiculeRapport, TypePanne } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type LigneSeed = {
  codeVehicule: string;
  immatriculation?: string;
  categorie: CategorieVehicule;
  statut: StatutVehiculeRapport;
  typesPannes?: TypePanne[];
  description?: string;
};

type SiteSeed = {
  nom: string;
  code: string;
  region: string;
  couleur: string;
  responsable: { nom: string; prenom: string; email: string; motDePasse: string; telephone?: string };
  lignes: LigneSeed[];
};

const DATE_RAPPORT = new Date('2026-04-13T07:00:00.000Z');

const sites: SiteSeed[] = [
  // ─────────────────────────────────────────────────────────
  // ASSINIE — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Assinie',
    code: 'ASSINIE',
    region: 'Sud-Comoé',
    couleur: '#10b981', // emerald-500
    responsable: { nom: 'Konan', prenom: 'Eric', email: 'responsable.assinie@sate.ci', motDePasse: 'Assinie@2026', telephone: '+22507000001' },
    lignes: [
      { codeVehicule: 'TR30KJ01',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR857',       categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRXPLAGE',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRCRIBLEUSE', categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      {
        codeVehicule: 'V50',
        categorie: 'VOITURETTE',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Besoin de reconstruction, problème de moteur',
      },
      {
        codeVehicule: 'TR28',
        categorie: 'TRACTEUR',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE', 'ELECTRICITE'],
        description: 'Problème de pompe à eau, besoin urgement de Batterie 100 Ah',
      },
      {
        codeVehicule: 'TR30',
        categorie: 'TRACTEUR',
        statut: 'EN_ATTENTE',
        typesPannes: ['SOUDURE'],
        description: 'La benne se trouve à la Soudure au garage 2FA à BONOUA',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BONOUA — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Bonoua',
    code: 'BONOUA',
    region: 'Sud-Comoé',
    couleur: '#f59e0b', // amber-500
    responsable: { nom: 'Yao', prenom: 'Lambert', email: 'responsable.bonoua@sate.ci', motDePasse: 'Bonoua@2026', telephone: '+22507000002' },
    lignes: [
      { codeVehicule: 'T97',  categorie: 'TASSEUR', statut: 'OPERATIONNEL' },
      { codeVehicule: 'T118', categorie: 'TASSEUR', statut: 'OPERATIONNEL' },
      { codeVehicule: 'T87',  categorie: 'TASSEUR', statut: 'ACCIDENTE' },
      {
        codeVehicule: 'T94',
        categorie: 'TASSEUR',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Problème de culasse',
      },
      {
        codeVehicule: 'T102',
        categorie: 'TASSEUR',
        statut: 'EN_PANNE',
        typesPannes: ['PNEU', 'MECANIQUE'],
        description: 'Besoin de pneus 315/80 (02), besoin de parallélisme',
      },
      {
        codeVehicule: 'T113',
        categorie: 'TASSEUR',
        statut: 'EN_PANNE',
        typesPannes: ['POMPE_INJECTION'],
        description: 'Problème de pompe à injection et injecteurs',
      },
      {
        codeVehicule: 'A29',
        categorie: 'AMPLIROLL',
        statut: 'EN_ATTENTE',
        typesPannes: ['CARROSSERIE'],
        description: 'Toujours au garage 2FA depuis juillet 2025 pour problème de châssis',
      },
      {
        codeVehicule: 'A30',
        categorie: 'AMPLIROLL',
        statut: 'EN_ATTENTE',
        typesPannes: ['POMPE_INJECTION'],
        description: 'Au garage Kama pour problème de pompe à injection et injecteurs',
      },
      { codeVehicule: 'A37',     categorie: 'AMPLIROLL', statut: 'ACCIDENTE' },
      { codeVehicule: 'A43',     immatriculation: '802', categorie: 'AMPLIROLL', statut: 'ACCIDENTE' },
      {
        codeVehicule: 'A44',
        categorie: 'AMPLIROLL',
        statut: 'EN_PANNE',
        typesPannes: ['ELECTRICITE'],
        description: "Problème d'allumage toujours pas résolu",
      },
      {
        codeVehicule: 'A45',
        immatriculation: '696',
        categorie: 'AMPLIROLL',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Trois amortisseurs cassés, un ballon cassé',
      },
      {
        codeVehicule: 'PC1477',
        categorie: 'PC',
        statut: 'EN_PANNE',
        typesPannes: ['PNEU'],
        description: 'Besoin urgement de pneus 315/80 (03 pneus)',
      },
      {
        codeVehicule: 'BP06',
        categorie: 'BP',
        statut: 'EN_ATTENTE',
        typesPannes: ['MECANIQUE'],
        description: "Au garage 2FA à Abidjan pour entretiens mécaniques depuis plus d'un mois",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BASSAM — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Grand-Bassam',
    code: 'BASSAM',
    region: 'Sud-Comoé',
    couleur: '#6366f1', // indigo-500
    responsable: { nom: 'Assi', prenom: 'Rodrigue', email: 'responsable.bassam@sate.ci', motDePasse: 'Bassam@2026', telephone: '+22507000003' },
    lignes: [
      { codeVehicule: 'V153', categorie: 'VOITURETTE', statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR23', categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'KIA',  categorie: 'KIA',        statut: 'OPERATIONNEL' },
      {
        codeVehicule: 'V46',
        categorie: 'VOITURETTE',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Problème de moteur (le moteur se trouve à 2FA)',
      },
      {
        codeVehicule: 'V86',
        categorie: 'VOITURETTE',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Problème de plateau',
      },
      {
        codeVehicule: 'TR24',
        categorie: 'TRACTEUR',
        statut: 'EN_PANNE',
        typesPannes: ['MECANIQUE'],
        description: 'Problème de pompe à eau, problème de radiateur',
      },
      {
        codeVehicule: 'KBTIMITE',
        categorie: 'KB',
        statut: 'EN_ATTENTE',
        typesPannes: ['MECANIQUE'],
        description: 'Au Garage Kama pour entretiens générales',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // MAN — SIA
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Man',
    code: 'MAN',
    region: 'SIA',
    couleur: '#ef4444', // red-500
    responsable: { nom: 'Coulibaly', prenom: 'Ibrahim', email: 'responsable.man@sate.ci', motDePasse: 'Man@2026', telephone: '+22507000004' },
    lignes: [
      { codeVehicule: 'T50',          immatriculation: '9919GU01', categorie: 'TASSEUR',      statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA212CF',     immatriculation: 'AA-212-CF', categorie: 'TASSEUR',     statut: 'OPERATIONNEL' },
      { codeVehicule: 'T52',          immatriculation: '6629GV01', categorie: 'TASSEUR',      statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA987CB',     immatriculation: 'AA-987-CB', categorie: 'TASSEUR',     statut: 'ACCIDENTE',   description: 'Au garage 2FA' },
      {
        codeVehicule: 'TAA876CA',
        immatriculation: 'AA-876-CA',
        categorie: 'TASSEUR',
        statut: 'EN_ATTENTE',
        typesPannes: ['MECANIQUE'],
        description: "Problème de sélecteur, de l'appareil de vitesse — toujours en attente de dépannage",
      },
      { codeVehicule: 'BPAA765ST',   immatriculation: 'AA-765-ST', categorie: 'BP',           statut: 'OPERATIONNEL' },
      {
        codeVehicule: 'BP1298LR01',
        immatriculation: '1298LR01',
        categorie: 'BP',
        statut: 'EN_PANNE',
        typesPannes: ['HYDRAULIQUE'],
        description: 'Panne hydraulique (en attente de dépannage)',
      },
      { codeVehicule: 'A47',          immatriculation: '2982LT',   categorie: 'AMPLIROLL',    statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT01',      categorie: 'TRACTEUR',       statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT02',      categorie: 'TRACTEUR',       statut: 'OPERATIONNEL' },
      {
        codeVehicule: 'TRACT1539LX01',
        immatriculation: '1539LX01',
        categorie: 'TRACTEUR',
        statut: 'OPERATIONNEL',
        description: "Besoin d'huile de vérin",
      },
      { codeVehicule: 'TRICYCLE01', categorie: 'MOTO_TRICYCLE', statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE02', categorie: 'MOTO_TRICYCLE', statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE03', categorie: 'MOTO_TRICYCLE', statut: 'OPERATIONNEL' },
    ],
  },
];

async function main() {
  console.log('🌱 Début du seed...\n');

  for (const site of sites) {
    // 1. Upsert du site (avec couleur)
    const siteRecord = await prisma.site.upsert({
      where: { code: site.code },
      update: { nom: site.nom, region: site.region, couleur: site.couleur },
      create: { nom: site.nom, code: site.code, region: site.region, couleur: site.couleur },
    });
    console.log(`✅ Site "${site.nom}" (${site.code}) couleur: ${site.couleur} — id: ${siteRecord.id}`);

    // 2. Upsert du compte responsable
    const existing = await prisma.responsableSite.findUnique({ where: { email: site.responsable.email } });
    if (!existing) {
      const hash = await bcrypt.hash(site.responsable.motDePasse, 10);
      await prisma.responsableSite.create({
        data: {
          email:     site.responsable.email,
          password:  hash,
          nom:       site.responsable.nom,
          prenom:    site.responsable.prenom,
          telephone: site.responsable.telephone ?? null,
          siteId:    siteRecord.id,
        },
      });
      console.log(`   👤 Compte responsable créé → ${site.responsable.email} / mdp: ${site.responsable.motDePasse}`);
    } else {
      console.log(`   👤 Compte responsable déjà existant → ${site.responsable.email} (ignoré)`);
    }

    // 3. Vérifier si un rapport existe déjà pour ce site + cette date
    const startOfDay = new Date(DATE_RAPPORT);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(DATE_RAPPORT);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingRapport = await prisma.rapportJournalier.findFirst({
      where: {
        siteId: siteRecord.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existingRapport) {
      console.log(`   ↩  Rapport du 13/04/2026 déjà existant pour ${site.nom} — ignoré\n`);
      continue;
    }

    // 4. Créer le rapport avec ses lignes
    const rapport = await prisma.rapportJournalier.create({
      data: {
        date: DATE_RAPPORT,
        siteId: siteRecord.id,
        lignes: {
          create: site.lignes.map((l) => ({
            codeVehicule:    l.codeVehicule,
            immatriculation: l.immatriculation ?? null,
            categorie:       l.categorie,
            statut:          l.statut,
            typesPannes:     l.typesPannes ?? [],
            description:     l.description ?? null,
          })),
        },
      },
      include: { lignes: true },
    });

    const ops   = rapport.lignes.filter((l) => l.statut === 'OPERATIONNEL').length;
    const total = rapport.lignes.length;
    console.log(`   📋 Rapport créé — ${total} véhicule(s), ${ops} opérationnel(s), ${total - ops} hors-service\n`);
  }

  console.log('✨ Seed terminé avec succès.');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
