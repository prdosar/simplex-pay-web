'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export interface CreateOfferResult {
  error?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isFr(locale: string | undefined) {
  return locale !== 'en';
}

export async function createDevisesOfferAction(
  payload: {
    locale: string;
    type: string;
    sellCountryCode: string;
    buyCountryCode: string;
    amount: number;
    rate: number;
    minAmount: number;
    maxAmount: number;
    notes?: string;
    expiryHours: number;
    paymentMethods: { paymentMethodId: string; side: 'From' | 'To' }[];
  },
): Promise<CreateOfferResult> {
  const user = await getCurrentUser();
  const fr = isFr(payload.locale);
  if (!user) {
    return { error: fr ? 'Vous devez être connecté.' : 'You must be logged in.' };
  }

  const amount = Number(payload.amount);
  const rate = Number(payload.rate);
  const minAmount = Number(payload.minAmount);
  const maxAmount = Number(payload.maxAmount);
  const expiryHours = Number(payload.expiryHours);

  if (!payload.sellCountryCode || !payload.buyCountryCode || payload.sellCountryCode === payload.buyCountryCode) {
    return { error: fr ? 'Pays de vente et d\'achat invalides.' : 'Invalid sell/buy countries.' };
  }
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(rate) || rate <= 0) {
    return { error: fr ? 'Montant ou taux invalide.' : 'Invalid amount or rate.' };
  }
  if (!Number.isFinite(minAmount) || !Number.isFinite(maxAmount) || minAmount > maxAmount) {
    return { error: fr ? 'Montants min/max invalides.' : 'Invalid min/max amounts.' };
  }
  if (![24, 48, 72, 168].includes(expiryHours)) {
    return { error: fr ? 'Durée de validité invalide.' : 'Invalid expiry duration.' };
  }
  const methods = (payload.paymentMethods ?? []).filter(
    m => UUID_RE.test(m.paymentMethodId) && (m.side === 'From' || m.side === 'To'),
  );
  for (const m of methods) {
    const exists = await prisma.countryPaymentMethods.findUnique({
      where: {
        CountryCode_PaymentMethodId: {
          CountryCode: m.side === 'From' ? payload.sellCountryCode : payload.buyCountryCode,
          PaymentMethodId: m.paymentMethodId,
        },
      },
    });
    if (!exists) {
      return { error: fr ? 'Méthode de paiement invalide.' : 'Invalid payment method.' };
    }
  }

  await prisma.offers.create({
    data: {
      CreatorId: user.id,
      Type: payload.type === 'Buy' ? 'Buy' : 'Sell',
      SellCountryCode: payload.sellCountryCode,
      BuyCountryCode: payload.buyCountryCode,
      Amount: amount,
      Rate: rate,
      MinAmount: minAmount,
      MaxAmount: maxAmount,
      Notes: payload.notes?.trim() || null,
      ExpiresAt: new Date(Date.now() + expiryHours * 3600_000),
      PaymentMethods: {
        create: methods.map(m => ({ PaymentMethodId: m.paymentMethodId, Side: m.side })),
      },
    },
  });

  revalidatePath('/', 'layout');

  return {};
}

export async function createTravelKiloOfferAction(
  payload: {
    locale: string;
    availableKg: number;
    pricePerKg: number;
    travelDate: string;
    departureCity: string;
    destinationCity: string;
    departureCountryCode: string;
    destinationCountryCode: string;
    notes?: string;
  },
): Promise<CreateOfferResult> {
  const user = await getCurrentUser();
  const fr = isFr(payload.locale);
  if (!user) {
    return { error: fr ? 'Vous devez être connecté.' : 'You must be logged in.' };
  }

  const availableKg = Number(payload.availableKg);
  const pricePerKg = Number(payload.pricePerKg);
  const travelDate = new Date(payload.travelDate);

  if (!payload.departureCountryCode || !payload.destinationCountryCode) {
    return { error: fr ? 'Pays de départ et de destination requis.' : 'Departure and destination countries are required.' };
  }
  if (!Number.isFinite(availableKg) || availableKg <= 0 || availableKg > 500) {
    return { error: fr ? 'Poids invalide.' : 'Invalid weight.' };
  }
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
    return { error: fr ? 'Prix par kg invalide.' : 'Invalid price per kg.' };
  }
  if (!payload.departureCity.trim() || !payload.destinationCity.trim()) {
    return { error: fr ? 'Villes requises.' : 'Cities are required.' };
  }
  if (Number.isNaN(travelDate.getTime()) || travelDate < new Date()) {
    return { error: fr ? 'Date de voyage invalide.' : 'Invalid travel date.' };
  }

  await prisma.travelKiloOffers.create({
    data: {
      CreatorId: user.id,
      AvailableKg: availableKg,
      PricePerKg: pricePerKg,
      TravelDate: travelDate,
      DepartureCity: payload.departureCity.trim(),
      DestinationCity: payload.destinationCity.trim(),
      DepartureCountryCode: payload.departureCountryCode,
      DestinationCountryCode: payload.destinationCountryCode,
      Notes: payload.notes?.trim() || null,
      ExpiresAt: travelDate,
    },
  });

  revalidatePath('/', 'layout');

  return {};
}

export async function createBoatShippingOfferAction(
  payload: {
    locale: string;
    availableLbs: number;
    pricePerLb: number;
    shipDepartureDate: string;
    departurePort: string;
    destinationPort: string;
    departureCountryCode: string;
    destinationCountryCode: string;
    notes?: string;
  },
): Promise<CreateOfferResult> {
  const user = await getCurrentUser();
  const fr = isFr(payload.locale);
  if (!user) {
    return { error: fr ? 'Vous devez être connecté.' : 'You must be logged in.' };
  }

  const availableLbs = Number(payload.availableLbs);
  const pricePerLb = Number(payload.pricePerLb);
  const shipDepartureDate = new Date(payload.shipDepartureDate);

  if (!payload.departureCountryCode || !payload.destinationCountryCode) {
    return { error: fr ? 'Pays de départ et de destination requis.' : 'Departure and destination countries are required.' };
  }
  if (!Number.isFinite(availableLbs) || availableLbs <= 0) {
    return { error: fr ? 'Poids invalide.' : 'Invalid weight.' };
  }
  if (!Number.isFinite(pricePerLb) || pricePerLb <= 0) {
    return { error: fr ? 'Prix par livre invalide.' : 'Invalid price per lb.' };
  }
  if (!payload.departurePort.trim() || !payload.destinationPort.trim()) {
    return { error: fr ? 'Ports requis.' : 'Ports are required.' };
  }
  if (Number.isNaN(shipDepartureDate.getTime()) || shipDepartureDate < new Date()) {
    return { error: fr ? 'Date de départ invalide.' : 'Invalid departure date.' };
  }

  await prisma.boatShippingOffers.create({
    data: {
      CreatorId: user.id,
      AvailableLbs: availableLbs,
      PricePerLb: pricePerLb,
      ShipDepartureDate: shipDepartureDate,
      DeparturePort: payload.departurePort.trim(),
      DestinationPort: payload.destinationPort.trim(),
      DepartureCountryCode: payload.departureCountryCode,
      DestinationCountryCode: payload.destinationCountryCode,
      Notes: payload.notes?.trim() || null,
      ExpiresAt: shipDepartureDate,
    },
  });

  revalidatePath('/', 'layout');

  return {};
}
