// Le DTO renvoyé par /api/auth/login (backend AuthResponse + UserDto de Auth/Dtos/AuthResponse.cs).
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: LoggedUserDto
}

// Représentation du user connecté (login). Distinct de AdminUserDto (liste enrichie).
export interface LoggedUserDto {
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

// Ligne du tableau /api/admin/users (données enrichies pour l'admin).
export interface AdminUserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  country: string
  status: string
  isCertified: boolean
  transactionCount: number
  rating: number
  reviewCount: number
  whatsAppNumber?: string
  createdAt: string
  isAdmin?: boolean
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminOfferDto {
  id: string
  type: string
  sellCurrency: string
  buyCurrency: string
  sellCountry: string
  buyCountry: string
  sellCountryFlag: string
  buyCountryFlag: string
  amount: number
  remainingAmount: number
  rate: number
  minAmount: number
  maxAmount: number
  notes?: string
  status: string
  expiresAt: string
  createdAt: string
  creator: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface AdminStatsDto {
  totalUsers: number
  totalOffers: number
  activeOffers: number
  totalTransactions: number
  newUsersThisWeek: number
  newOffersThisWeek: number
}

export interface ActivityLogDto {
  id: string
  timestamp: string
  userId?: string
  userFirstName?: string
  userLastName?: string
  userEmail?: string
  ipAddress: string
  userAgent?: string
  method: string
  path: string
  action: string
  statusCode: number
  country?: string
  city?: string
}

// Le DTO renvoyé par /api/travel-kilo (endpoint public, réutilisé côté admin pour lister).
export interface TravelKiloOfferDto {
  id: string
  creatorId: string
  creatorFirstName: string
  creatorRating: number
  creatorReviewCount: number
  creatorIsCertified: boolean
  availableKg: number
  pricePerKg: number
  travelDate: string
  departureCity: string
  destinationCity: string
  departureCountryCode: string
  destinationCountryCode: string
  notes?: string
  status: string
  expiresAt: string
  createdAt: string
}

// Le DTO renvoyé par /api/boat-shipping (endpoint public, réutilisé côté admin pour lister).
export interface BoatShippingOfferDto {
  id: string
  creatorId: string
  creatorFirstName: string
  creatorRating: number
  creatorReviewCount: number
  creatorIsCertified: boolean
  availableLbs: number
  pricePerLb: number
  shipDepartureDate: string
  departurePort: string
  destinationPort: string
  departureCountryCode: string
  destinationCountryCode: string
  notes?: string
  status: string
  expiresAt: string
  createdAt: string
}
