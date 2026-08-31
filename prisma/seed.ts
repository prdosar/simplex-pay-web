import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

const USERS = [
  {
    Id: '20000000-0000-0000-0000-000000000001',
    FirstName: 'Kossi',
    LastName: 'Agbeko',
    Email: 'kossi@demo.sn',
    Phone: '+221770000001',
    WhatsApp: '+221770000001',
    CountryCode: 'SN',
    Rating: 4.8,
    TransactionCount: 132,
  },
  {
    Id: '20000000-0000-0000-0000-000000000002',
    FirstName: 'Aminata',
    LastName: 'Diallo',
    Email: 'aminata@demo.ci',
    Phone: '+225070000002',
    WhatsApp: '+225070000002',
    CountryCode: 'CI',
    Rating: 4.6,
    TransactionCount: 98,
  },
  {
    Id: '20000000-0000-0000-0000-000000000003',
    FirstName: 'Jean-Marc',
    LastName: 'Nkoulou',
    Email: 'jeanmarc@demo.cm',
    Phone: '+237690000003',
    WhatsApp: '+237690000003',
    CountryCode: 'CM',
    Rating: 4.9,
    TransactionCount: 210,
  },
  {
    Id: '20000000-0000-0000-0000-000000000004',
    FirstName: 'Fatou',
    LastName: 'Traore',
    Email: 'fatou@demo.ml',
    Phone: '+22370000004',
    CountryCode: 'ML',
    Rating: 4.3,
    TransactionCount: 54,
  },
  {
    Id: '20000000-0000-0000-0000-000000000005',
    FirstName: 'David',
    LastName: 'Mensah',
    Email: 'david@demo.ca',
    Phone: '+15140000005',
    WhatsApp: '+15140000005',
    CountryCode: 'CA',
    Rating: 5.0,
    TransactionCount: 76,
  },
];

const PM = {
  Cash: '10000000-0000-0000-0000-000000000001',
  Interac: '10000000-0000-0000-0000-000000000002',
  Wave: '10000000-0000-0000-0000-000000000004',
  OrangeCI: '10000000-0000-0000-0000-000000000008',
  OrangeCM: '10000000-0000-0000-0000-000000000011',
};

type SeedOffer = {
  Id: string;
  CreatorId: string;
  Type: string;
  SellCountryCode: string;
  BuyCountryCode: string;
  Amount: number;
  Rate: number;
  MinAmount: number;
  MaxAmount: number;
  Notes?: string;
  ExpiresInHours: number;
  methods: { id: string; side: 'From' | 'To' }[];
};

// Country codes must exist in the reference Countries table
const OFFERS: SeedOffer[] = [
  {
    // First sell country (alphabetical) is Benin — keep it non-empty for first load
    Id: '30000000-0000-0000-0000-000000000001',
    CreatorId: '20000000-0000-0000-0000-000000000002', Type: 'Sell',
    SellCountryCode: 'BJ', BuyCountryCode: 'CA',
    Amount: 900000, Rate: 0.0024, MinAmount: 50000, MaxAmount: 500000,
    Notes: 'XOF vers CAD depuis Cotonou. Wave ou cash au centre-ville.',
    ExpiresInHours: 48,
    methods: [{ id: PM.Cash, side: 'From' }, { id: PM.Interac, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000002',
    CreatorId: '20000000-0000-0000-0000-000000000001', Type: 'Sell',
    SellCountryCode: 'TG', BuyCountryCode: 'CA',
    Amount: 500000, Rate: 0.0024, MinAmount: 50000, MaxAmount: 500000,
    Notes: 'XOF vers CAD. Rencontre centre-ville Lomé ou envoi mobile money.',
    ExpiresInHours: 48,
    methods: [{ id: PM.Cash, side: 'From' }, { id: PM.Interac, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000003',
    CreatorId: '20000000-0000-0000-0000-000000000002', Type: 'Sell',
    SellCountryCode: 'CI', BuyCountryCode: 'CA',
    Amount: 1500000, Rate: 0.0024, MinAmount: 100000, MaxAmount: 1000000,
    Notes: 'XOF vers CAD. Interac instantané après confirmation Wave.',
    ExpiresInHours: 72,
    methods: [{ id: PM.Wave, side: 'From' }, { id: PM.OrangeCI, side: 'From' }, { id: PM.Interac, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000004',
    CreatorId: '20000000-0000-0000-0000-000000000005', Type: 'Buy',
    SellCountryCode: 'CA', BuyCountryCode: 'SN',
    Amount: 3000, Rate: 415.5, MinAmount: 100, MaxAmount: 3000,
    Notes: "J'achète des CAD contre XOF. Paiement Wave/Orange Money Dakar.",
    ExpiresInHours: 24,
    methods: [{ id: PM.Interac, side: 'From' }, { id: PM.Wave, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000005',
    CreatorId: '20000000-0000-0000-0000-000000000003', Type: 'Sell',
    SellCountryCode: 'CM', BuyCountryCode: 'GN',
    Amount: 800000, Rate: 15.4, MinAmount: 50000, MaxAmount: 400000,
    Notes: 'XAF vers GNF. Cash à Douala ou transfert mobile.',
    ExpiresInHours: 48,
    methods: [{ id: PM.Cash, side: 'From' }, { id: PM.OrangeCM, side: 'From' }, { id: PM.Cash, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000006',
    CreatorId: '20000000-0000-0000-0000-000000000004', Type: 'Sell',
    SellCountryCode: 'ML', BuyCountryCode: 'SN',
    Amount: 2500000, Rate: 1, MinAmount: 250000, MaxAmount: 1500000,
    Notes: 'XOF Bamako → XOF Dakar, même devise, transfert régional rapide.',
    ExpiresInHours: 72,
    methods: [{ id: PM.Wave, side: 'From' }, { id: PM.Wave, side: 'To' }],
  },
  {
    Id: '30000000-0000-0000-0000-000000000007',
    CreatorId: '20000000-0000-0000-0000-000000000001', Type: 'Sell',
    SellCountryCode: 'SN', BuyCountryCode: 'GH',
    Amount: 1200000, Rate: 0.0245, MinAmount: 100000, MaxAmount: 600000,
    Notes: 'XOF vers GHS à Accra. Remise cash ou mobile money.',
    ExpiresInHours: 36,
    methods: [{ id: PM.Wave, side: 'From' }, { id: PM.Cash, side: 'To' }],
  },
];

const TRAVEL_KILO = [
  {
    CreatorId: '20000000-0000-0000-0000-000000000001',
    AvailableKg: 25, PricePerKg: 12,
    TravelDate: daysFromNow(6), DepartureCity: 'Dakar', DestinationCity: 'Abidjan',
    DepartureCountryCode: 'SN', DestinationCountryCode: 'CI',
    Notes: 'Valises larges, emballage soigné. Dépôt AIBD.', ExpiresAt: daysFromNow(5),
  },
  {
    CreatorId: '20000000-0000-0000-0000-000000000005',
    AvailableKg: 40, PricePerKg: 10,
    TravelDate: daysFromNow(10), DepartureCity: 'Montréal', DestinationCity: 'Abidjan',
    DepartureCountryCode: 'CA', DestinationCountryCode: 'CI',
    Notes: 'Vol direct YUL–ABJ. Colis électroniques acceptés.', ExpiresAt: daysFromNow(9),
  },
  {
    CreatorId: '20000000-0000-0000-0000-000000000003',
    AvailableKg: 15, PricePerKg: 15,
    TravelDate: daysFromNow(3), DepartureCity: 'Douala', DestinationCity: 'Brazzaville',
    DepartureCountryCode: 'CM', DestinationCountryCode: 'CG',
    ExpiresAt: daysFromNow(2),
  },
  {
    CreatorId: '20000000-0000-0000-0000-000000000002',
    AvailableKg: 30, PricePerKg: 8.5,
    TravelDate: daysFromNow(14), DepartureCity: 'Abidjan', DestinationCity: 'Montréal',
    DepartureCountryCode: 'CI', DestinationCountryCode: 'CA',
    Notes: 'Deux bagages en soute. Prix dégressif dès 20 kg.', ExpiresAt: daysFromNow(13),
  },
];

const BOAT_SHIPPING = [
  {
    CreatorId: '20000000-0000-0000-0000-000000000005',
    AvailableLbs: 500, PricePerLb: 3.2,
    ShipDepartureDate: daysFromNow(20), DeparturePort: 'Montréal', DestinationPort: 'Pointe-Noire',
    DepartureCountryCode: 'CA', DestinationCountryCode: 'CG',
    Notes: 'Conteneur groupage, départ mensuel. Barils acceptés.', ExpiresAt: daysFromNow(18),
  },
  {
    CreatorId: '20000000-0000-0000-0000-000000000003',
    AvailableLbs: 1200, PricePerLb: 2.1,
    ShipDepartureDate: daysFromNow(25), DeparturePort: 'Douala', DestinationPort: 'Libreville',
    DepartureCountryCode: 'CM', DestinationCountryCode: 'GA',
    ExpiresAt: daysFromNow(22),
  },
  {
    CreatorId: '20000000-0000-0000-0000-000000000002',
    AvailableLbs: 300, PricePerLb: 4.5,
    ShipDepartureDate: daysFromNow(15), DeparturePort: 'Abidjan', DestinationPort: 'Dakar',
    DepartureCountryCode: 'CI', DestinationCountryCode: 'SN',
    Notes: 'Fret rapide corridor Abidjan–Dakar.', ExpiresAt: daysFromNow(14),
  },
];

async function main() {
  const password = hashPassword('Password123!');
  for (const u of USERS) {
    await prisma.users.upsert({
      where: { Email: u.Email },
      update: {},
      create: { ...u, PasswordHash: password, Status: 'Active' },
    });
  }
  console.log(`Seeded ${USERS.length} users (password: Password123!)`);

  if ((await prisma.offers.count()) === 0) {
    for (const o of OFFERS) {
      const { methods, ExpiresInHours, Id, ...data } = o;
      await prisma.offers.upsert({
        where: { Id },
        update: {},
        create: {
          Id,
          ...data,
          Status: 'Open',
          ExpiresAt: hoursFromNow(ExpiresInHours),
          PaymentMethods: {
            create: methods.map(m => ({ PaymentMethodId: m.id, Side: m.side })),
          },
        },
      });
    }
    console.log(`Seeded ${OFFERS.length} offers`);
  } else {
    console.log(`Offers already present (${await prisma.offers.count()}), skipping`);
  }

  if ((await prisma.travelKiloOffers.count()) === 0) {
    await prisma.travelKiloOffers.createMany({ data: TRAVEL_KILO });
    console.log(`Seeded ${TRAVEL_KILO.length} travel kilo offers`);
  }

  if ((await prisma.boatShippingOffers.count()) === 0) {
    await prisma.boatShippingOffers.createMany({ data: BOAT_SHIPPING });
    console.log(`Seeded ${BOAT_SHIPPING.length} boat shipping offers`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
