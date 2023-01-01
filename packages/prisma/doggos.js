import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const allDoggos = await prisma.doggo.findMany();

  console.log(allDoggos);
})();
