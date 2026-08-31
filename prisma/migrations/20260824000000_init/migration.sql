-- CreateTable
CREATE TABLE "Users" (
    "Id" UUID NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Phone" TEXT,
    "WhatsApp" TEXT,
    "PasswordHash" TEXT NOT NULL,
    "CountryCode" TEXT,
    "Rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "TransactionCount" INTEGER NOT NULL DEFAULT 0,
    "Status" TEXT NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "Id" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Offers" (
    "Id" UUID NOT NULL,
    "CreatorId" UUID NOT NULL,
    "Type" TEXT NOT NULL,
    "SellCountryCode" TEXT NOT NULL,
    "BuyCountryCode" TEXT NOT NULL,
    "Amount" DECIMAL(18,2) NOT NULL,
    "AmountFilled" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "Rate" DECIMAL(18,6) NOT NULL,
    "MinAmount" DECIMAL(18,2) NOT NULL,
    "MaxAmount" DECIMAL(18,2) NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'Open',
    "Notes" TEXT,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OfferPaymentMethods" (
    "OfferId" UUID NOT NULL,
    "PaymentMethodId" UUID NOT NULL,
    "Side" TEXT NOT NULL,

    CONSTRAINT "OfferPaymentMethods_pkey" PRIMARY KEY ("OfferId","PaymentMethodId","Side")
);

-- CreateTable
CREATE TABLE "TravelKiloOffers" (
    "Id" UUID NOT NULL,
    "CreatorId" UUID NOT NULL,
    "AvailableKg" DECIMAL(10,2) NOT NULL,
    "PricePerKg" DECIMAL(10,2) NOT NULL,
    "TravelDate" TIMESTAMP(3) NOT NULL,
    "DepartureCity" TEXT NOT NULL,
    "DestinationCity" TEXT NOT NULL,
    "DepartureCountryCode" TEXT NOT NULL,
    "DestinationCountryCode" TEXT NOT NULL,
    "Notes" TEXT,
    "Status" TEXT NOT NULL DEFAULT 'Open',
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelKiloOffers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BoatShippingOffers" (
    "Id" UUID NOT NULL,
    "CreatorId" UUID NOT NULL,
    "AvailableLbs" DECIMAL(12,2) NOT NULL,
    "PricePerLb" DECIMAL(10,2) NOT NULL,
    "ShipDepartureDate" TIMESTAMP(3) NOT NULL,
    "DeparturePort" TEXT NOT NULL,
    "DestinationPort" TEXT NOT NULL,
    "DepartureCountryCode" TEXT NOT NULL,
    "DestinationCountryCode" TEXT NOT NULL,
    "Notes" TEXT,
    "Status" TEXT NOT NULL DEFAULT 'Open',
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoatShippingOffers_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "Sessions_ExpiresAt_idx" ON "Sessions"("ExpiresAt");

-- CreateIndex
CREATE INDEX "Offers_Status_ExpiresAt_CreatedAt_idx" ON "Offers"("Status", "ExpiresAt", "CreatedAt");

-- CreateIndex
CREATE INDEX "Offers_SellCountryCode_idx" ON "Offers"("SellCountryCode");

-- CreateIndex
CREATE INDEX "Offers_CreatorId_idx" ON "Offers"("CreatorId");

-- CreateIndex
CREATE INDEX "OfferPaymentMethods_PaymentMethodId_idx" ON "OfferPaymentMethods"("PaymentMethodId");

-- CreateIndex
CREATE INDEX "TravelKiloOffers_Status_ExpiresAt_idx" ON "TravelKiloOffers"("Status", "ExpiresAt");

-- CreateIndex
CREATE INDEX "TravelKiloOffers_DepartureCountryCode_DestinationCountryCod_idx" ON "TravelKiloOffers"("DepartureCountryCode", "DestinationCountryCode");

-- CreateIndex
CREATE INDEX "TravelKiloOffers_CreatorId_idx" ON "TravelKiloOffers"("CreatorId");

-- CreateIndex
CREATE INDEX "BoatShippingOffers_Status_ExpiresAt_idx" ON "BoatShippingOffers"("Status", "ExpiresAt");

-- CreateIndex
CREATE INDEX "BoatShippingOffers_DepartureCountryCode_DestinationCountryC_idx" ON "BoatShippingOffers"("DepartureCountryCode", "DestinationCountryCode");

-- CreateIndex
CREATE INDEX "BoatShippingOffers_CreatorId_idx" ON "BoatShippingOffers"("CreatorId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_CountryCode_fkey" FOREIGN KEY ("CountryCode") REFERENCES "Countries"("Code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offers" ADD CONSTRAINT "Offers_CreatorId_fkey" FOREIGN KEY ("CreatorId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offers" ADD CONSTRAINT "Offers_SellCountryCode_fkey" FOREIGN KEY ("SellCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offers" ADD CONSTRAINT "Offers_BuyCountryCode_fkey" FOREIGN KEY ("BuyCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPaymentMethods" ADD CONSTRAINT "OfferPaymentMethods_OfferId_fkey" FOREIGN KEY ("OfferId") REFERENCES "Offers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPaymentMethods" ADD CONSTRAINT "OfferPaymentMethods_PaymentMethodId_fkey" FOREIGN KEY ("PaymentMethodId") REFERENCES "PaymentMethods"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelKiloOffers" ADD CONSTRAINT "TravelKiloOffers_CreatorId_fkey" FOREIGN KEY ("CreatorId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelKiloOffers" ADD CONSTRAINT "TravelKiloOffers_DepartureCountryCode_fkey" FOREIGN KEY ("DepartureCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelKiloOffers" ADD CONSTRAINT "TravelKiloOffers_DestinationCountryCode_fkey" FOREIGN KEY ("DestinationCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatShippingOffers" ADD CONSTRAINT "BoatShippingOffers_CreatorId_fkey" FOREIGN KEY ("CreatorId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatShippingOffers" ADD CONSTRAINT "BoatShippingOffers_DepartureCountryCode_fkey" FOREIGN KEY ("DepartureCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatShippingOffers" ADD CONSTRAINT "BoatShippingOffers_DestinationCountryCode_fkey" FOREIGN KEY ("DestinationCountryCode") REFERENCES "Countries"("Code") ON DELETE RESTRICT ON UPDATE CASCADE;
