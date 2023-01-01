import { PrismaClient } from '@sst-test/prisma';

const prisma = new PrismaClient();

export const handler = async (event) => {
  try {
    const doggos = await prisma.doggo.findMany();
    // const doggos = {};

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(doggos),
    };
  } catch ({ message }) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: message,
    };
  }
};
