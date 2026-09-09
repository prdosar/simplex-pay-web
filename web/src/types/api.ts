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
  transactionCount: number
  phone?: string
  whatsApp?: string
}

export interface OfferPaymentMethodDto {
  name: string
  type: string
  side: 'From' | 'To'
}

export interface OfferDto {
  id: string
  type: 'Sell' | 'Buy'
  sellCurrency: string
  sellCurrencySymbol: string
  buyCurrency: string
  buyCurrencySymbol: string
  sellCountry: string
  sellCountryFlag: string
  buyCountry: string
  buyCountryFlag: string
  amount: number
  amountFilled: number
  remainingAmount: number
  rate: number
  buyEquivalent: number
  minAmount: number
  maxAmount: number
  status: string
  expiresAt: string
  createdAt: string
  creator: OfferCreatorDto
  paymentMethods: OfferPaymentMethodDto[]
  notes?: string
}

export interface TravelKiloOfferDto {
  id: string
  creatorId: string
  creatorFirstName: string
  creatorRating: number
  creatorTransactionCount: number
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
  creatorTransactionCount: number
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

export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  status: string
  rating: number
  transactionCount: number
  createdAt: string
}
