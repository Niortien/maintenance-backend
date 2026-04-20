import {
  PrismaClient,
  CategorieVehicule,
  StatutVehiculeRapport,
  TypePanne,
  TypeVehicule,
  Statut,
  Specialite,
} from '@prisma/client';
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

type VehiculeSeed = {
  nom: string;
  numero_de_plaque: string;
  annee: number;
  type: TypeVehicule;
  modele: string;
  statut: Statut;
};

type TechnicienSeed = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: Statut;
  specialite: Specialite;
};

type SiteSeed = {
  nom: string;
  code: string;
  region: string;
  couleur: string;
  responsable: { nom: string; prenom: string; email: string; motDePasse: string; telephone?: string };
  vehicules: VehiculeSeed[];
  techniciens: TechnicienSeed[];
  lignes: LigneSeed[];       // rapport 1 : 13/04/2026
  lignes2: LigneSeed[];      // rapport 2 : 14/04/2026
};

const DATE_RAPPORT  = new Date('2026-04-13T07:00:00.000Z');
const DATE_RAPPORT2 = new Date('2026-04-14T07:00:00.000Z');

const sites: SiteSeed[] = [
  // ─────────────────────────────────────────────────────────
  // ASSINIE — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Assinie',
    code: 'ASSINIE',
    region: 'Sud-Comoé',
    couleur: '#10b981',
    responsable: { nom: 'Konan', prenom: 'Eric', email: 'responsable.assinie@sate.ci', motDePasse: 'Assinie@2026', telephone: '+22507000001' },
    vehicules: [
      { nom: 'Tracteur TR30KJ01', numero_de_plaque: 'TR30KJ01', annee: 2018, type: 'EQUIPEMENT', modele: 'John Deere 5075E', statut: 'ACTIF' },
      { nom: 'Tracteur TR857',    numero_de_plaque: 'TR857',    annee: 2017, type: 'EQUIPEMENT', modele: 'Massey Ferguson 375', statut: 'ACTIF' },
      { nom: 'Voiturette V50',    numero_de_plaque: 'V50',      annee: 2019, type: 'VOITURE',    modele: 'Toyota Hilux', statut: 'EN_MAINTENANCE' },
      { nom: 'Tracteur TR28',     numero_de_plaque: 'TR28',     annee: 2016, type: 'EQUIPEMENT', modele: 'New Holland T5', statut: 'EN_MAINTENANCE' },
      { nom: 'Tracteur TR30',     numero_de_plaque: 'TR30',     annee: 2020, type: 'EQUIPEMENT', modele: 'Kubota M7', statut: 'ACTIF' },
      { nom: 'Tracteur Cribleuse',numero_de_plaque: 'TRCRIBLEUSE', annee: 2021, type: 'EQUIPEMENT', modele: 'Case IH Farmall', statut: 'ACTIF' },
    ],
    techniciens: [
      { nom: 'Kouassi', prenom: 'Jean', email: 'jean.kouassi.assinie@sate.ci', telephone: '+22501000101', statut: 'ACTIF', specialite: 'MECANIQUE_GENERALE' },
      { nom: 'Bamba',   prenom: 'Seydou', email: 'seydou.bamba.assinie@sate.ci', telephone: '+22501000102', statut: 'ACTIF', specialite: 'ELECTRICITE_AUTOMOBILE' },
      { nom: 'Touré',   prenom: 'Hamidou', email: 'hamidou.toure.assinie@sate.ci', telephone: '+22501000103', statut: 'ACTIF', specialite: 'HYDRAULIQUE' },
      { nom: 'Dosso',   prenom: 'Moussa', email: 'moussa.dosso.assinie@sate.ci', telephone: '+22501000104', statut: 'ACTIF', specialite: 'PNEUMATIQUE' },
      { nom: 'Koffi',   prenom: 'Alain', email: 'alain.koffi.assinie@sate.ci',   telephone: '+22501000105', statut: 'ACTIF', specialite: 'PEINTURE' },
    ],
    lignes: [
      { codeVehicule: 'TR30KJ01',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR857',       categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRXPLAGE',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRCRIBLEUSE', categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'V50',         categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Besoin de reconstruction, problème de moteur' },
      { codeVehicule: 'TR28',        categorie: 'TRACTEUR',   statut: 'EN_PANNE',  typesPannes: ['MECANIQUE', 'ELECTRICITE'], description: 'Problème de pompe à eau, besoin urgement de Batterie 100 Ah' },
      { codeVehicule: 'TR30',        categorie: 'TRACTEUR',   statut: 'EN_ATTENTE', typesPannes: ['SOUDURE'], description: 'La benne se trouve à la Soudure au garage 2FA à BONOUA' },
    ],
    lignes2: [
      { codeVehicule: 'TR30KJ01',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR857',       categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRXPLAGE',    categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRCRIBLEUSE', categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'V50',         categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Réfection moteur en cours' },
      { codeVehicule: 'TR28',        categorie: 'TRACTEUR',   statut: 'EN_PANNE',  typesPannes: ['MECANIQUE'], description: 'Pièces commandées, en attente de livraison' },
      { codeVehicule: 'TR30',        categorie: 'TRACTEUR',   statut: 'EN_ATTENTE', typesPannes: ['SOUDURE'], description: 'Retour prévu demain' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BONOUA — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Bonoua',
    code: 'BONOUA',
    region: 'Sud-Comoé',
    couleur: '#f59e0b',
    responsable: { nom: 'Yao', prenom: 'Lambert', email: 'responsable.bonoua@sate.ci', motDePasse: 'Bonoua@2026', telephone: '+22507000002' },
    vehicules: [
      { nom: 'Tasseur T97',   numero_de_plaque: 'T97',    annee: 2019, type: 'EQUIPEMENT', modele: 'Bomag BW 211 D-5', statut: 'ACTIF' },
      { nom: 'Tasseur T118',  numero_de_plaque: 'T118',   annee: 2021, type: 'EQUIPEMENT', modele: 'Dynapac CA2500D', statut: 'ACTIF' },
      { nom: 'Tasseur T87',   numero_de_plaque: 'T87',    annee: 2015, type: 'EQUIPEMENT', modele: 'Hamm HD 120i VV', statut: 'EN_MAINTENANCE' },
      { nom: 'Ampliroll A29', numero_de_plaque: 'A29',    annee: 2018, type: 'CAMINON',    modele: 'Mercedes Actros', statut: 'EN_MAINTENANCE' },
      { nom: 'Ampliroll A37', numero_de_plaque: 'A37',    annee: 2016, type: 'CAMINON',    modele: 'Renault Trucks T', statut: 'EN_MAINTENANCE' },
      { nom: 'BP BP06',       numero_de_plaque: 'BP06',   annee: 2020, type: 'EQUIPEMENT', modele: 'Caterpillar CS11', statut: 'EN_MAINTENANCE' },
    ],
    techniciens: [
      { nom: 'Assié',    prenom: 'Christophe', email: 'christophe.assie.bonoua@sate.ci',   telephone: '+22501000201', statut: 'ACTIF', specialite: 'MECANIQUE_GENERALE' },
      { nom: 'N\'Guessan', prenom: 'Paul',     email: 'paul.nguessan.bonoua@sate.ci',       telephone: '+22501000202', statut: 'ACTIF', specialite: 'HYDRAULIQUE' },
      { nom: 'Koné',     prenom: 'Drissa',     email: 'drissa.kone.bonoua@sate.ci',         telephone: '+22501000203', statut: 'ACTIF', specialite: 'PNEUMATIQUE' },
      { nom: 'Ahoutou',  prenom: 'René',       email: 'rene.ahoutou.bonoua@sate.ci',        telephone: '+22501000204', statut: 'ACTIF', specialite: 'ELECTRICITE_AUTOMOBILE' },
      { nom: 'Traoré',   prenom: 'Lamine',     email: 'lamine.traore.bonoua@sate.ci',       telephone: '+22501000205', statut: 'ACTIF', specialite: 'CARROSSERIE' },
    ],
    lignes: [
      { codeVehicule: 'T97',     categorie: 'TASSEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'T118',    categorie: 'TASSEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'T87',     categorie: 'TASSEUR',   statut: 'ACCIDENTE' },
      { codeVehicule: 'T94',     categorie: 'TASSEUR',   statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Problème de culasse' },
      { codeVehicule: 'T102',    categorie: 'TASSEUR',   statut: 'EN_PANNE', typesPannes: ['PNEU', 'MECANIQUE'], description: 'Besoin de pneus 315/80 (02), besoin de parallélisme' },
      { codeVehicule: 'T113',    categorie: 'TASSEUR',   statut: 'EN_PANNE', typesPannes: ['POMPE_INJECTION'], description: 'Problème de pompe à injection et injecteurs' },
      { codeVehicule: 'A29',     categorie: 'AMPLIROLL', statut: 'EN_ATTENTE', typesPannes: ['CARROSSERIE'], description: 'Toujours au garage 2FA depuis juillet 2025 pour problème de châssis' },
      { codeVehicule: 'A30',     categorie: 'AMPLIROLL', statut: 'EN_ATTENTE', typesPannes: ['POMPE_INJECTION'], description: 'Au garage Kama pour problème de pompe à injection et injecteurs' },
      { codeVehicule: 'A37',     categorie: 'AMPLIROLL', statut: 'ACCIDENTE' },
      { codeVehicule: 'A43',     immatriculation: '802', categorie: 'AMPLIROLL', statut: 'ACCIDENTE' },
      { codeVehicule: 'A44',     categorie: 'AMPLIROLL', statut: 'EN_PANNE', typesPannes: ['ELECTRICITE'], description: "Problème d'allumage toujours pas résolu" },
      { codeVehicule: 'A45',     immatriculation: '696', categorie: 'AMPLIROLL', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Trois amortisseurs cassés, un ballon cassé' },
      { codeVehicule: 'PC1477',  categorie: 'PC',        statut: 'EN_PANNE', typesPannes: ['PNEU'], description: 'Besoin urgement de pneus 315/80 (03 pneus)' },
      { codeVehicule: 'BP06',    categorie: 'BP',        statut: 'EN_ATTENTE', typesPannes: ['MECANIQUE'], description: "Au garage 2FA à Abidjan pour entretiens mécaniques depuis plus d'un mois" },
    ],
    lignes2: [
      { codeVehicule: 'T97',    categorie: 'TASSEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'T118',   categorie: 'TASSEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'T87',    categorie: 'TASSEUR',   statut: 'ACCIDENTE' },
      { codeVehicule: 'T94',    categorie: 'TASSEUR',   statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Culasse en attente de remplacement' },
      { codeVehicule: 'T102',   categorie: 'TASSEUR',   statut: 'EN_PANNE', typesPannes: ['PNEU'], description: 'Pneus commandés' },
      { codeVehicule: 'T113',   categorie: 'TASSEUR',   statut: 'OPERATIONNEL', description: 'Pompe remplacée, retour en service' },
      { codeVehicule: 'A29',    categorie: 'AMPLIROLL', statut: 'EN_ATTENTE', typesPannes: ['CARROSSERIE'], description: 'Toujours au garage 2FA' },
      { codeVehicule: 'A30',    categorie: 'AMPLIROLL', statut: 'EN_ATTENTE', typesPannes: ['POMPE_INJECTION'], description: 'Au garage Kama' },
      { codeVehicule: 'A37',    categorie: 'AMPLIROLL', statut: 'ACCIDENTE' },
      { codeVehicule: 'A44',    categorie: 'AMPLIROLL', statut: 'EN_PANNE', typesPannes: ['ELECTRICITE'], description: 'Diagnostic en cours' },
      { codeVehicule: 'A45',    immatriculation: '696', categorie: 'AMPLIROLL', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Amortisseurs commandés' },
      { codeVehicule: 'PC1477', categorie: 'PC', statut: 'OPERATIONNEL', description: 'Pneus livrés et montés' },
      { codeVehicule: 'BP06',   categorie: 'BP', statut: 'EN_ATTENTE', typesPannes: ['MECANIQUE'], description: 'Toujours au garage 2FA' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // GRAND-BASSAM — SUD-COMOÉ (SATE)
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Grand-Bassam',
    code: 'BASSAM',
    region: 'Sud-Comoé',
    couleur: '#6366f1',
    responsable: { nom: 'Assi', prenom: 'Rodrigue', email: 'responsable.bassam@sate.ci', motDePasse: 'Bassam@2026', telephone: '+22507000003' },
    vehicules: [
      { nom: 'Voiturette V153', numero_de_plaque: 'V153', annee: 2022, type: 'VOITURE',    modele: 'Toyota Land Cruiser', statut: 'ACTIF' },
      { nom: 'Tracteur TR23',   numero_de_plaque: 'TR23', annee: 2019, type: 'EQUIPEMENT', modele: 'New Holland T6', statut: 'ACTIF' },
      { nom: 'KIA Pickup',      numero_de_plaque: 'KIA01',annee: 2021, type: 'CAMIONNETTE', modele: 'KIA K2500', statut: 'ACTIF' },
      { nom: 'Voiturette V46',  numero_de_plaque: 'V46',  annee: 2016, type: 'VOITURE',    modele: 'Nissan Pickup', statut: 'EN_MAINTENANCE' },
      { nom: 'Tracteur TR24',   numero_de_plaque: 'TR24', annee: 2018, type: 'EQUIPEMENT', modele: 'John Deere 6120M', statut: 'EN_MAINTENANCE' },
      { nom: 'KB Timité',       numero_de_plaque: 'KBTIMITE', annee: 2015, type: 'EQUIPEMENT', modele: 'Komatsu WB97', statut: 'EN_MAINTENANCE' },
    ],
    techniciens: [
      { nom: 'Aka',     prenom: 'Justin',   email: 'justin.aka.bassam@sate.ci',    telephone: '+22501000301', statut: 'ACTIF', specialite: 'MECANIQUE_GENERALE' },
      { nom: 'Yéboué',  prenom: 'François', email: 'francois.yeboue.bassam@sate.ci', telephone: '+22501000302', statut: 'ACTIF', specialite: 'ELECTRICITE_AUTOMOBILE' },
      { nom: 'Loba',    prenom: 'Anicet',   email: 'anicet.loba.bassam@sate.ci',   telephone: '+22501000303', statut: 'ACTIF', specialite: 'DIAGNOSTIC_ELECTRONIQUE' },
      { nom: 'Kpan',    prenom: 'Bernard',  email: 'bernard.kpan.bassam@sate.ci',  telephone: '+22501000304', statut: 'ACTIF', specialite: 'HYDRAULIQUE' },
      { nom: 'Gbagbo',  prenom: 'Théodore', email: 'theodore.gbagbo.bassam@sate.ci', telephone: '+22501000305', statut: 'ACTIF', specialite: 'SYSTEME_FREINAGE' },
    ],
    lignes: [
      { codeVehicule: 'V153',     categorie: 'VOITURETTE', statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR23',     categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'KIA',      categorie: 'KIA',        statut: 'OPERATIONNEL' },
      { codeVehicule: 'V46',      categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Problème de moteur (le moteur se trouve à 2FA)' },
      { codeVehicule: 'V86',      categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Problème de plateau' },
      { codeVehicule: 'TR24',     categorie: 'TRACTEUR',   statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Problème de pompe à eau, problème de radiateur' },
      { codeVehicule: 'KBTIMITE', categorie: 'KB',         statut: 'EN_ATTENTE', typesPannes: ['MECANIQUE'], description: 'Au Garage Kama pour entretiens générales' },
    ],
    lignes2: [
      { codeVehicule: 'V153',     categorie: 'VOITURETTE', statut: 'OPERATIONNEL' },
      { codeVehicule: 'TR23',     categorie: 'TRACTEUR',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'KIA',      categorie: 'KIA',        statut: 'OPERATIONNEL' },
      { codeVehicule: 'V46',      categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Moteur reçu, montage en cours' },
      { codeVehicule: 'V86',      categorie: 'VOITURETTE', statut: 'EN_PANNE', typesPannes: ['MECANIQUE'], description: 'Plateau commandé' },
      { codeVehicule: 'TR24',     categorie: 'TRACTEUR',   statut: 'OPERATIONNEL', description: 'Pompe et radiateur remplacés' },
      { codeVehicule: 'KBTIMITE', categorie: 'KB',         statut: 'EN_ATTENTE', typesPannes: ['MECANIQUE'], description: 'Entretien toujours en cours chez Kama' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // MAN — SIA
  // ─────────────────────────────────────────────────────────
  {
    nom: 'Man',
    code: 'MAN',
    region: 'SIA',
    couleur: '#ef4444',
    responsable: { nom: 'Coulibaly', prenom: 'Ibrahim', email: 'responsable.man@sate.ci', motDePasse: 'Man@2026', telephone: '+22507000004' },
    vehicules: [
      { nom: 'Tasseur T50',     numero_de_plaque: '9919GU01',  annee: 2020, type: 'EQUIPEMENT',  modele: 'Bomag BW 219 DH', statut: 'ACTIF' },
      { nom: 'Tasseur T52',     numero_de_plaque: '6629GV01',  annee: 2020, type: 'EQUIPEMENT',  modele: 'Dynapac CA3500D', statut: 'ACTIF' },
      { nom: 'BP AA765ST',      numero_de_plaque: 'AA-765-ST', annee: 2021, type: 'EQUIPEMENT',  modele: 'Caterpillar CB10', statut: 'ACTIF' },
      { nom: 'Ampliroll A47',   numero_de_plaque: '2982LT',    annee: 2019, type: 'CAMINON',     modele: 'Volvo FH16', statut: 'ACTIF' },
      { nom: 'Tracteur TR01',   numero_de_plaque: 'TRACT01',   annee: 2022, type: 'EQUIPEMENT',  modele: 'John Deere 7R 250', statut: 'ACTIF' },
      { nom: 'Moto Tricycle 1', numero_de_plaque: 'TRICYCLE01', annee: 2023, type: 'CAMIONNETTE', modele: 'Piaggio Ape Max', statut: 'ACTIF' },
    ],
    techniciens: [
      { nom: 'Diallo',  prenom: 'Mamadou',  email: 'mamadou.diallo.man@sate.ci',  telephone: '+22501000401', statut: 'ACTIF', specialite: 'MECANIQUE_GENERALE' },
      { nom: 'Konaté',  prenom: 'Aboubakar', email: 'aboubakar.konate.man@sate.ci', telephone: '+22501000402', statut: 'ACTIF', specialite: 'HYDRAULIQUE' },
      { nom: 'Camara',  prenom: 'Siaka',    email: 'siaka.camara.man@sate.ci',    telephone: '+22501000403', statut: 'ACTIF', specialite: 'ELECTRICITE_AUTOMOBILE' },
      { nom: 'Fofana',  prenom: 'Oumar',    email: 'oumar.fofana.man@sate.ci',    telephone: '+22501000404', statut: 'ACTIF', specialite: 'PNEUMATIQUE' },
      { nom: 'Cissé',   prenom: 'Karim',    email: 'karim.cisse.man@sate.ci',     telephone: '+22501000405', statut: 'ACTIF', specialite: 'TRANSMISSION' },
    ],
    lignes: [
      { codeVehicule: 'T50',          immatriculation: '9919GU01',  categorie: 'TASSEUR',      statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA212CF',     immatriculation: 'AA-212-CF', categorie: 'TASSEUR',      statut: 'OPERATIONNEL' },
      { codeVehicule: 'T52',          immatriculation: '6629GV01',  categorie: 'TASSEUR',      statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA987CB',     immatriculation: 'AA-987-CB', categorie: 'TASSEUR',      statut: 'ACCIDENTE', description: 'Au garage 2FA' },
      { codeVehicule: 'TAA876CA',     immatriculation: 'AA-876-CA', categorie: 'TASSEUR',      statut: 'EN_ATTENTE', typesPannes: ['MECANIQUE'], description: "Problème de sélecteur de vitesse — en attente de dépannage" },
      { codeVehicule: 'BPAA765ST',    immatriculation: 'AA-765-ST', categorie: 'BP',           statut: 'OPERATIONNEL' },
      { codeVehicule: 'BP1298LR01',   immatriculation: '1298LR01',  categorie: 'BP',           statut: 'EN_PANNE', typesPannes: ['HYDRAULIQUE'], description: 'Panne hydraulique (en attente de dépannage)' },
      { codeVehicule: 'A47',          immatriculation: '2982LT',    categorie: 'AMPLIROLL',    statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT01',      categorie: 'TRACTEUR',       statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT02',      categorie: 'TRACTEUR',       statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT1539LX01', immatriculation: '1539LX01', categorie: 'TRACTEUR',    statut: 'OPERATIONNEL', description: "Besoin d'huile de vérin" },
      { codeVehicule: 'TRICYCLE01',   categorie: 'MOTO_TRICYCLE',  statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE02',   categorie: 'MOTO_TRICYCLE',  statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE03',   categorie: 'MOTO_TRICYCLE',  statut: 'OPERATIONNEL' },
    ],
    lignes2: [
      { codeVehicule: 'T50',         immatriculation: '9919GU01',  categorie: 'TASSEUR',     statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA212CF',    immatriculation: 'AA-212-CF', categorie: 'TASSEUR',     statut: 'OPERATIONNEL' },
      { codeVehicule: 'T52',         immatriculation: '6629GV01',  categorie: 'TASSEUR',     statut: 'OPERATIONNEL' },
      { codeVehicule: 'TAA987CB',    immatriculation: 'AA-987-CB', categorie: 'TASSEUR',     statut: 'ACCIDENTE', description: 'Au garage 2FA — toujours en attente' },
      { codeVehicule: 'TAA876CA',    immatriculation: 'AA-876-CA', categorie: 'TASSEUR',     statut: 'OPERATIONNEL', description: 'Sélecteur remplacé, retour en service' },
      { codeVehicule: 'BPAA765ST',   immatriculation: 'AA-765-ST', categorie: 'BP',          statut: 'OPERATIONNEL' },
      { codeVehicule: 'BP1298LR01',  immatriculation: '1298LR01',  categorie: 'BP',          statut: 'EN_PANNE', typesPannes: ['HYDRAULIQUE'], description: 'Pièces hydrauliques en route' },
      { codeVehicule: 'A47',         immatriculation: '2982LT',    categorie: 'AMPLIROLL',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT01',     categorie: 'TRACTEUR',        statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT02',     categorie: 'TRACTEUR',        statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRACT1539LX01', immatriculation: '1539LX01', categorie: 'TRACTEUR',  statut: 'OPERATIONNEL', description: 'Huile de vérin ajoutée' },
      { codeVehicule: 'TRICYCLE01',  categorie: 'MOTO_TRICYCLE',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE02',  categorie: 'MOTO_TRICYCLE',   statut: 'OPERATIONNEL' },
      { codeVehicule: 'TRICYCLE03',  categorie: 'MOTO_TRICYCLE',   statut: 'OPERATIONNEL' },
    ],
  },
];

async function main() {
  console.log('🌱 Début du seed...\n');

  for (const site of sites) {
    // 1. Upsert du site
    const siteRecord = await prisma.site.upsert({
      where: { code: site.code },
      update: { nom: site.nom, region: site.region, couleur: site.couleur },
      create: { nom: site.nom, code: site.code, region: site.region, couleur: site.couleur },
    });
    console.log(`✅ Site "${site.nom}" (${site.code}) — id: ${siteRecord.id}`);

    // 2. Upsert compte responsable (force mise à jour du mot de passe)
    const hash = await bcrypt.hash(site.responsable.motDePasse, 10);
    await prisma.responsableSite.upsert({
      where: { email: site.responsable.email },
      update: {
        password: hash,
        nom: site.responsable.nom, prenom: site.responsable.prenom,
        telephone: site.responsable.telephone ?? null, siteId: siteRecord.id,
      },
      create: {
        email: site.responsable.email, password: hash,
        nom: site.responsable.nom, prenom: site.responsable.prenom,
        telephone: site.responsable.telephone ?? null, siteId: siteRecord.id,
      },
    });
    console.log(`   👤 Responsable upsert → ${site.responsable.email}`);

    // 3. Véhicules
    for (const v of site.vehicules) {
      const existing = await prisma.vehicule.findFirst({ where: { numero_de_plaque: v.numero_de_plaque } });
      if (!existing) {
        await prisma.vehicule.create({
          data: {
            nom: v.nom, numero_de_plaque: v.numero_de_plaque, annee: v.annee,
            type: v.type, modele: v.modele, statut: v.statut, siteId: siteRecord.id,
          },
        });
      }
    }
    console.log(`   🚗 ${site.vehicules.length} véhicule(s) traité(s)`);

    // 4. Techniciens
    for (const t of site.techniciens) {
      await prisma.technicien.upsert({
        where: { email: t.email },
        update: { siteId: siteRecord.id, statut: t.statut },
        create: {
          nom: t.nom, prenom: t.prenom, email: t.email, telephone: t.telephone,
          statut: t.statut, specialite: t.specialite, siteId: siteRecord.id,
        },
      });
    }
    console.log(`   👷 ${site.techniciens.length} technicien(s) upsertés`);

    // 5. Rapports (2 par site)
    for (const [dateRapport, lignes, label] of [
      [DATE_RAPPORT,  site.lignes,  '13/04/2026'] as const,
      [DATE_RAPPORT2, site.lignes2, '14/04/2026'] as const,
    ]) {
      const startOfDay = new Date(dateRapport); startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay   = new Date(dateRapport); endOfDay.setUTCHours(23, 59, 59, 999);

      const existingRapport = await prisma.rapportJournalier.findFirst({
        where: { siteId: siteRecord.id, date: { gte: startOfDay, lte: endOfDay } },
      });

      if (existingRapport) {
        console.log(`   ↩  Rapport ${label} déjà existant — ignoré`);
        continue;
      }

      const rapport = await prisma.rapportJournalier.create({
        data: {
          date: dateRapport, siteId: siteRecord.id,
          lignes: {
            create: lignes.map((l) => ({
              codeVehicule: l.codeVehicule, immatriculation: l.immatriculation ?? null,
              categorie: l.categorie, statut: l.statut,
              typesPannes: l.typesPannes ?? [], description: l.description ?? null,
            })),
          },
        },
        include: { lignes: true },
      });

      const ops = rapport.lignes.filter((l) => l.statut === 'OPERATIONNEL').length;
      console.log(`   📋 Rapport ${label} — ${rapport.lignes.length} véhicule(s), ${ops} opérationnel(s)`);
    }

    console.log('');
  }

  console.log('✨ Seed terminé avec succès.');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
