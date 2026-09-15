export interface CurrencyDto {
  code: string
  name: string
  nameFr: string
  symbol: string
  type: 'Buy' | 'Sell'
  decimalPlaces: number
}

export interface PaymentMethodDto {
  id: string
  name: string
  description?: string
  type: string
  logoUrl?: string
  isPopular: boolean
}

export interface CountryDto {
  code: string
  name: string
  nameFr: string
  currencyCode: string
  currencyType: 'Buy' | 'Sell'
  flag: string
  paymentMethods: PaymentMethodDto[]
}

export interface OfferCreatorDto {
  id: string
  firstName: string
  lastName?: string
  rating: number
  reviewCount: number
  transactionCount: number
  isCertified: boolean
  phone?: string
  whatsApp?: string
}

export interface UserProfileDto {
  id: string
  firstName: string
  lastName?: string
  country: string
  isCertified: boolean
  rating: number
  reviewCount: number
  transactionCount: number
  memberSince: string
}

export interface ReviewDto {
  id: string
  reviewerId: string
  reviewerFirstName: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt?: string
}

export interface OfferPaymentMethodDto {
  name: string
  type: string
  side: 'From' | 'To'
}

export type OfferRateMode = 'Fixed' | 'GoogleDaily' | 'XeDaily'

export interface OfferDto {
  id: string
  type: 'Sell' | 'Buy'
  sellCurrency: string
  sellCurrencySymbol: string
  buyCurrency: string
  buyCurrencySymbol: string
  /** Pays côté devise-produit — plusieurs (intégrations UEMOA/CEMAC). Tous partagent sellCurrency. */
  sellCountries: string[]
  buyCountry: string
  buyCountryFlag: string
  amount: number
  amountFilled: number
  remainingAmount: number
  rateMode: OfferRateMode
  rate: number | null
  buyEquivalent: number
  minAmount: number
  maxAmount: number | null
  status: string
  /** Null = ne jamais expirer (offres devises). Le créateur clôture manuellement. */
  expiresAt: string | null
  createdAt: string
  creator: OfferCreatorDto
  paymentMethods: OfferPaymentMethodDto[]
  notes?: string
}

export interface ExchangeRatePair {
  from: string
  to: string
  google: number | null
  xe: number | null
  fetchedAt: string
}

export interface TravelKiloOfferDto {
  id: string
  creatorId: string
  creatorFirstName: string
  creatorRating: number
  creatorReviewCount: number
  creatorTransactionCount: number
  creatorIsCertified: boolean
  creatorPhone?: string
  creatorWhatsApp?: string
  availableKg: number
  pricePerKg: number
  travelDate: string
  departureCity: string
  destinationCity: string
  departureCountryCode: string
  destinationCountryCode: string
  departureCountryFlag: string
  destinationCountryFlag: string
  notes?: string
  status: string
  expiresAt: string
  createdAt: string
}

export interface BoatShippingOfferDto {
  id: string
  creatorId: string
  creatorFirstName: string
  creatorRating: number
  creatorReviewCount: number
  creatorTransactionCount: number
  creatorIsCertified: boolean
  creatorPhone?: string
  creatorWhatsApp?: string
  availableLbs: number
  pricePerLb: number
  shipDepartureDate: string
  departurePort: string
  destinationPort: string
  departureCountryCode: string
  destinationCountryCode: string
  departureCountryFlag: string
  destinationCountryFlag: string
  notes?: string
  status: string
  expiresAt: string
  createdAt: string
}

export interface PaymentMethodFacet {
  id: string
  name: string
  count: number
}

export interface CountryFacet {
  code: string
  count: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: UserDto
}

export interface NotificationDto {
  id: string
  type: 'OfferInquiry' | 'NewReview' | string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface PagedNotifications {
  items: NotificationDto[]
  total: number
  unreadCount: number
}

// Aligné avec backend/SimplexPay.Application/Features/Auth/Dtos/AuthResponse.cs UserDto.
export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  whatsAppNumber?: string
  country: string
  rating: number
  transactionCount: number
  status: string
  emailVerified: boolean
  isAdmin: boolean
}
