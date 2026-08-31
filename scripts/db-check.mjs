import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const count = await prisma.offers.count();
console.log('offers count:', count);
const sample = await prisma.offers.findMany({
  take: 2,
  include: { Creator: true, SellCountry: { include: { Currency: true } }, BuyCountry: { include: { Currency: true } }, PaymentMethods: true },
});
for (const o of sample) {
  console.log(o.Id, o.Status, o.ExpiresAt, o.SellCountryCode, '->', o.BuyCountryCode, o.Creator.FirstName);
}
const openNow = await prisma.offers.count({ where: { Status: 'Open', ExpiresAt: { gt: new Date() } } });
console.log('open & not expired:', openNow);
await prisma.$disconnect();
