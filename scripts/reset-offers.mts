import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

await prisma.offerPaymentMethods.deleteMany();
await prisma.offers.deleteMany();
console.log('Offers cleared');
await prisma.$disconnect();
