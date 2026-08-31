import { cache } from 'react';
import { prisma } from './prisma';
import { Prisma } from '../generated/prisma/client';
import type {
  BoatShippingOfferDto,
  CountryDto,
  CurrencyDto,
  OfferCreatorDto,
  OfferDto,
  PagedResult,
  TravelKiloOfferDto,
} from '@/types/api';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function num(value: unknown): number {
  return value == null ? 0 : Number(value);
}

function toDate(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

// ── Reference data ──────────────────────────────────────────────────────────

export const getCountries = cache(async (): Promise<CountryDto[]> => {
  const rows = await prisma.countries.findMany({
    where: { IsActive: true },
    orderBy: { NameFr: 'asc' },
    include: {
      Currency: true,
      CountryPaymentMethods: {
        where: { PaymentMethod: { IsActive: true } },
        include: { PaymentMethod: true },
      },
    },
  });

  return rows.map(c => ({
    code: c.Code,
    name: c.Name,
    nameFr: c.NameFr,
    currencyCode: c.CurrencyCode,
    currencyType: c.Currency.Type as CountryDto['currencyType'],
    flag: c.Flag,
    paymentMethods: c.CountryPaymentMethods.map(pm => ({
      id: pm.PaymentMethod.Id,
      name: pm.PaymentMethod.Name,
      description: pm.PaymentMethod.Description ?? undefined,
      type: pm.PaymentMethod.Type,
      logoUrl: pm.PaymentMethod.LogoUrl ?? undefined,
      isPopular: pm.IsPopular,
    })),
  }));
});

export const getCurrencies = cache(async (): Promise<CurrencyDto[]> => {
  const rows = await prisma.supportedCurrencies.findMany({
    where: { IsActive: true },
    orderBy: { Code: 'asc' },
  });

  return rows.map(c => ({
    code: c.Code,
    name: c.Name,
    nameFr: c.NameFr,
    symbol: c.Symbol,
    type: c.Type as CurrencyDto['type'],
    decimalPlaces: c.DecimalPlaces,
  }));
});

// ── Offers (devises) ────────────────────────────────────────────────────────

const OFFER_INCLUDE = {
  Creator: true,
  SellCountry: { include: { Currency: true } },
  BuyCountry: { include: { Currency: true } },
  PaymentMethods: { include: { PaymentMethod: true } },
} as const;

type OfferRow = Prisma.OffersGetPayload<{ include: typeof OFFER_INCLUDE }>;

function mapCreator(u: OfferRow['Creator'], includeContact: boolean): OfferCreatorDto {
  return {
    id: u.Id,
    firstName: u.FirstName,
    lastName: u.LastName || undefined,
    rating: u.Rating,
    transactionCount: u.TransactionCount,
    ...(includeContact
      ? { phone: u.Phone ?? undefined, whatsApp: u.WhatsApp ?? undefined }
      : {}),
  };
}

function mapOffer(o: OfferRow, includeContact = false): OfferDto {
  const remaining = num(o.Amount) - num(o.AmountFilled);
  return {
    id: o.Id,
    type: o.Type as OfferDto['type'],
    sellCurrency: o.SellCountry.Currency.Code,
    sellCurrencySymbol: o.SellCountry.Currency.Symbol,
    buyCurrency: o.BuyCountry.Currency.Code,
    buyCurrencySymbol: o.BuyCountry.Currency.Symbol,
    sellCountry: o.SellCountryCode,
    sellCountryFlag: o.SellCountry.Flag,
    buyCountry: o.BuyCountryCode,
    buyCountryFlag: o.BuyCountry.Flag,
    amount: num(o.Amount),
    amountFilled: num(o.AmountFilled),
    remainingAmount: remaining,
    rate: num(o.Rate),
    buyEquivalent: Math.round(remaining * num(o.Rate) * 100) / 100,
    minAmount: num(o.MinAmount),
    maxAmount: num(o.MaxAmount),
    status: o.Status,
    expiresAt: toDate(o.ExpiresAt),
    createdAt: toDate(o.CreatedAt),
    creator: mapCreator(o.Creator, includeContact),
    paymentMethods: o.PaymentMethods.map(r => ({
      name: r.PaymentMethod.Name,
      type: r.PaymentMethod.Type,
      side: r.Side as 'From' | 'To',
    })),
    notes: o.Notes ?? undefined,
  };
}

export interface OfferFilters {
  sellCountryCode?: string;
  paymentMethodIds?: string[];
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

export type OfferSort = 'recent' | 'rate_desc' | 'rate_asc' | 'amount_desc';

function offerWhere(filters: OfferFilters) {
  const now = new Date();
  const conditions: Prisma.OffersWhereInput[] = [
    { Status: 'Open', ExpiresAt: { gt: now } },
  ];

  if (filters.sellCountryCode) conditions.push({ SellCountryCode: filters.sellCountryCode });
  if (filters.paymentMethodIds?.length) {
    conditions.push({
      PaymentMethods: { some: { PaymentMethodId: { in: filters.paymentMethodIds } } },
    });
  }
  if (filters.minAmount != null) conditions.push({ Amount: { gte: filters.minAmount } });
  if (filters.maxAmount != null) conditions.push({ Amount: { lte: filters.maxAmount } });
  if (filters.search) {
    const q = { contains: filters.search, mode: 'insensitive' as const };
    conditions.push({
      OR: [
        { Notes: q },
        { Creator: { FirstName: q } },
        { Creator: { LastName: q } },
        { SellCountry: { Name: q } },
        { SellCountry: { NameFr: q } },
        { BuyCountry: { Name: q } },
        { BuyCountry: { NameFr: q } },
        { SellCountry: { Currency: { Code: q } } },
        { BuyCountry: { Currency: { Code: q } } },
      ],
    });
  }

  return { AND: conditions };
}

function offerOrderBy(sort: OfferSort) {
  switch (sort) {
    case 'rate_desc': return { Rate: 'desc' as const };
    case 'rate_asc': return { Rate: 'asc' as const };
    case 'amount_desc': return { Amount: 'desc' as const };
    default: return { CreatedAt: 'desc' as const };
  }
}

export async function searchOffers(
  filters: OfferFilters,
  sort: OfferSort,
  page: number,
  pageSize: number,
): Promise<PagedResult<OfferDto>> {
  const where = offerWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.offers.findMany({
      where,
      orderBy: offerOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: OFFER_INCLUDE,
    }),
    prisma.offers.count({ where }),
  ]);

  return {
    items: rows.map(o => mapOffer(o)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOfferById(id: string): Promise<OfferDto | null> {
  if (!UUID_RE.test(id)) return null;
  const offer = await prisma.offers.findUnique({ where: { Id: id }, include: OFFER_INCLUDE });
  return offer ? mapOffer(offer, true) : null;
}

export async function getUserOffers(userId: string, pageSize = 10): Promise<PagedResult<OfferDto>> {
  const where = { CreatorId: userId };
  const [rows, total] = await Promise.all([
    prisma.offers.findMany({
      where,
      orderBy: { CreatedAt: 'desc' },
      take: pageSize,
      include: OFFER_INCLUDE,
    }),
    prisma.offers.count({ where }),
  ]);

  return {
    items: rows.map(o => mapOffer(o, true)),
    total,
    page: 1,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface FacetRow {
  id: string;
  count: number;
}

export async function getOfferPaymentMethodFacets(
  filters: Omit<OfferFilters, 'paymentMethodIds'>,
): Promise<FacetRow[]> {
  const where = offerWhere(filters);
  const groups = await prisma.offerPaymentMethods.groupBy({
    by: ['PaymentMethodId'],
    where: { Offer: where },
    _count: { _all: true },
  });

  return groups.map(g => ({ id: g.PaymentMethodId, count: g._count._all }));
}

// ── Travel kilo ─────────────────────────────────────────────────────────────

const TK_INCLUDE = {
  Creator: true,
  DepartureCountry: { include: { Currency: true } },
  DestinationCountry: { include: { Currency: true } },
} as const;

type TravelKiloRow = Prisma.TravelKiloOffersGetPayload<{ include: typeof TK_INCLUDE }>;

function mapTravelKilo(t: TravelKiloRow, includeContact = false): TravelKiloOfferDto {
  return {
    id: t.Id,
    creatorId: t.Creator.Id,
    creatorFirstName: t.Creator.FirstName,
    creatorRating: t.Creator.Rating,
    creatorTransactionCount: t.Creator.TransactionCount,
    ...(includeContact
      ? { creatorPhone: t.Creator.Phone ?? undefined, creatorWhatsApp: t.Creator.WhatsApp ?? undefined }
      : {}),
    availableKg: num(t.AvailableKg),
    pricePerKg: num(t.PricePerKg),
    travelDate: toDate(t.TravelDate),
    departureCity: t.DepartureCity,
    destinationCity: t.DestinationCity,
    departureCountryCode: t.DepartureCountryCode,
    destinationCountryCode: t.DestinationCountryCode,
    departureCountryFlag: t.DepartureCountry.Flag,
    destinationCountryFlag: t.DestinationCountry.Flag,
    notes: t.Notes ?? undefined,
    status: t.Status,
    expiresAt: toDate(t.ExpiresAt),
    createdAt: toDate(t.CreatedAt),
  };
}

export interface RouteFilters {
  departureCountryCode?: string;
  destinationCountryCode?: string;
  search?: string;
}

function travelKiloWhere(filters: RouteFilters) {
  const conditions: Prisma.TravelKiloOffersWhereInput[] = [
    { Status: 'Open', ExpiresAt: { gt: new Date() } },
  ];
  if (filters.departureCountryCode) conditions.push({ DepartureCountryCode: filters.departureCountryCode });
  if (filters.destinationCountryCode) conditions.push({ DestinationCountryCode: filters.destinationCountryCode });
  if (filters.search) {
    const q = { contains: filters.search, mode: 'insensitive' as const };
    conditions.push({
      OR: [
        { DepartureCity: q },
        { DestinationCity: q },
        { Notes: q },
        { Creator: { FirstName: q } },
        { Creator: { LastName: q } },
      ],
    });
  }
  return { AND: conditions };
}

export async function searchTravelKilo(
  filters: RouteFilters,
  page: number,
  pageSize: number,
): Promise<PagedResult<TravelKiloOfferDto>> {
  const where = travelKiloWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.travelKiloOffers.findMany({
      where,
      orderBy: { CreatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: TK_INCLUDE,
    }),
    prisma.travelKiloOffers.count({ where }),
  ]);

  return {
    items: rows.map(t => mapTravelKilo(t)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ── Boat shipping ───────────────────────────────────────────────────────────

const BS_INCLUDE = {
  Creator: true,
  DepartureCountry: true,
  DestinationCountry: true,
} as const;

type BoatShippingRow = Prisma.BoatShippingOffersGetPayload<{ include: typeof BS_INCLUDE }>;

function mapBoatShipping(b: BoatShippingRow, includeContact = false): BoatShippingOfferDto {
  return {
    id: b.Id,
    creatorId: b.Creator.Id,
    creatorFirstName: b.Creator.FirstName,
    creatorRating: b.Creator.Rating,
    creatorTransactionCount: b.Creator.TransactionCount,
    ...(includeContact
      ? { creatorPhone: b.Creator.Phone ?? undefined, creatorWhatsApp: b.Creator.WhatsApp ?? undefined }
      : {}),
    availableLbs: num(b.AvailableLbs),
    pricePerLb: num(b.PricePerLb),
    shipDepartureDate: toDate(b.ShipDepartureDate),
    departurePort: b.DeparturePort,
    destinationPort: b.DestinationPort,
    departureCountryCode: b.DepartureCountryCode,
    destinationCountryCode: b.DestinationCountryCode,
    departureCountryFlag: b.DepartureCountry.Flag,
    destinationCountryFlag: b.DestinationCountry.Flag,
    notes: b.Notes ?? undefined,
    status: b.Status,
    expiresAt: toDate(b.ExpiresAt),
    createdAt: toDate(b.CreatedAt),
  };
}

function boatShippingWhere(filters: RouteFilters) {
  const conditions: Prisma.BoatShippingOffersWhereInput[] = [
    { Status: 'Open', ExpiresAt: { gt: new Date() } },
  ];
  if (filters.departureCountryCode) conditions.push({ DepartureCountryCode: filters.departureCountryCode });
  if (filters.destinationCountryCode) conditions.push({ DestinationCountryCode: filters.destinationCountryCode });
  if (filters.search) {
    const q = { contains: filters.search, mode: 'insensitive' as const };
    conditions.push({
      OR: [
        { DeparturePort: q },
        { DestinationPort: q },
        { Notes: q },
        { Creator: { FirstName: q } },
        { Creator: { LastName: q } },
      ],
    });
  }
  return { AND: conditions };
}

export async function searchBoatShipping(
  filters: RouteFilters,
  page: number,
  pageSize: number,
): Promise<PagedResult<BoatShippingOfferDto>> {
  const where = boatShippingWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.boatShippingOffers.findMany({
      where,
      orderBy: { CreatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: BS_INCLUDE,
    }),
    prisma.boatShippingOffers.count({ where }),
  ]);

  return {
    items: rows.map(b => mapBoatShipping(b)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
