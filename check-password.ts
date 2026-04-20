import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const emails = [
    { email: 'responsable.assinie@sate.ci', password: 'Assinie@2026' },
    { email: 'responsable.bonoua@sate.ci',  password: 'Bonoua@2026'  },
    { email: 'responsable.bassam@sate.ci',  password: 'Bassam@2026'  },
    { email: 'responsable.man@sate.ci',     password: 'Man@2026'     },
  ];

  for (const cred of emails) {
    const r = await prisma.responsableSite.findUnique({ where: { email: cred.email } });
    if (!r) {
      console.log(`❌ INTROUVABLE: ${cred.email}`);
      continue;
    }
    const ok = await bcrypt.compare(cred.password, r.password);
    console.log(`${ok ? '✅' : '❌'} ${cred.email} — password OK: ${ok}`);
  }
}

main().finally(() => prisma.$disconnect());
