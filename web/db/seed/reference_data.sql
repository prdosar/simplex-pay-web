--
-- PostgreSQL database dump
--

\restrict UlNjMQTNK1fsmYVTW4bVaJu342KKpY3agkp7r0INuDlXhAbFkpbhMWRShX04bH7

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: SupportedCurrencies; Type: TABLE DATA; Schema: public; Owner: simplexpay
--

INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('CAD', 'Canadian Dollar', 'Dollar canadien', 'CA$', 'Buy', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('EUR', 'Euro', 'Euro', '€', 'Buy', 2, false);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('GHS', 'Ghanaian Cedi', 'Cedi ghanéen', '₵', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('NGN', 'Nigerian Naira', 'Naira nigérian', '₦', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('USD', 'US Dollar', 'Dollar américain', 'US$', 'Buy', 2, false);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('XAF', 'Central African CFA Franc', 'Franc CFA BEAC', 'FCFA', 'Sell', 0, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('XOF', 'West African CFA Franc', 'Franc CFA BCEAO', 'FCFA', 'Sell', 0, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('GNF', 'Guinean Franc', 'Franc guinéen', 'FG', 'Sell', 0, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('SLE', 'Sierra Leonean Leone', 'Leone sierra-léonais', 'Le', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('LRD', 'Liberian Dollar', 'Dollar libérien', 'L$', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('GMD', 'Gambian Dalasi', 'Dalasi gambien', 'D', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('CVE', 'Cape Verdean Escudo', 'Escudo cap-verdien', 'Esc', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('CDF', 'Congolese Franc', 'Franc congolais', 'FC', 'Sell', 2, true);
INSERT INTO public."SupportedCurrencies" ("Code", "Name", "NameFr", "Symbol", "Type", "DecimalPlaces", "IsActive") VALUES ('STN', 'São Tomé Dobra', 'Dobra de São Tomé', 'Db', 'Sell', 2, true);


--
-- Data for Name: Countries; Type: TABLE DATA; Schema: public; Owner: simplexpay
--

INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('BF', 'Burkina Faso', 'Burkina Faso', '🇧🇫', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('BJ', 'Benin', 'Bénin', '🇧🇯', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CA', 'Canada', 'Canada', '🇨🇦', true, 'CAD');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CF', 'Central African Republic', 'RCA', '🇨🇫', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CG', 'Congo', 'Congo-Brazzaville', '🇨🇬', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CI', 'Ivory Coast', 'Côte d''Ivoire', '🇨🇮', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CM', 'Cameroon', 'Cameroun', '🇨🇲', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GA', 'Gabon', 'Gabon', '🇬🇦', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GQ', 'Equatorial Guinea', 'Guinée Équatoriale', '🇬🇶', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GW', 'Guinea-Bissau', 'Guinée-Bissau', '🇬🇼', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('ML', 'Mali', 'Mali', '🇲🇱', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('NE', 'Niger', 'Niger', '🇳🇪', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('SN', 'Senegal', 'Sénégal', '🇸🇳', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('TD', 'Chad', 'Tchad', '🇹🇩', true, 'XAF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('TG', 'Togo', 'Togo', '🇹🇬', true, 'XOF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GH', 'Ghana', 'Ghana', '🇬🇭', true, 'GHS');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('NG', 'Nigeria', 'Nigeria', '🇳🇬', true, 'NGN');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GN', 'Guinea', 'Guinée-Conakry', '🇬🇳', true, 'GNF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('SL', 'Sierra Leone', 'Sierra Leone', '🇸🇱', true, 'SLE');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('LR', 'Liberia', 'Libéria', '🇱🇷', true, 'LRD');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('GM', 'Gambia', 'Gambie', '🇬🇲', true, 'GMD');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CV', 'Cabo Verde', 'Cap-Vert', '🇨🇻', true, 'CVE');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('CD', 'DR Congo', 'RD Congo', '🇨🇩', true, 'CDF');
INSERT INTO public."Countries" ("Code", "Name", "NameFr", "Flag", "IsActive", "CurrencyCode") VALUES ('ST', 'São Tomé and Príncipe', 'Sao Tomé-et-Príncipe', '🇸🇹', true, 'STN');


--
-- Data for Name: PaymentMethods; Type: TABLE DATA; Schema: public; Owner: simplexpay
--

INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000001', 'Cash', 'Remise en main propre', 'Cash', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000002', 'Interac e-Transfer', 'Virement Interac (Canada)', 'BankTransfer', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000004', 'Wave', 'Mobile Money Wave', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000008', 'Orange Money CI', 'Orange Money Côte d''Ivoire', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000009', 'Moov Money CI', 'Moov Money Côte d''Ivoire', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000011', 'Orange Money CM', 'Orange Money Cameroun', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000003', 'Virement bancaire', 'Virement SWIFT / bancaire', 'BankTransfer', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000005', 'Orange Money SN', 'Orange Money Sénégal', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000006', 'Free Money', 'Free Money Sénégal', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000007', 'MTN MoMo CI', 'MTN Mobile Money Côte d''Ivoire', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000010', 'MTN MoMo CM', 'MTN Mobile Money Cameroun', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000012', 'Orange Money ML', 'Orange Money Mali', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000013', 'Moov Money ML', 'Moov Money Mali', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000014', 'OPay', 'OPay Nigeria', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000015', 'PalmPay', 'PalmPay Nigeria', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000016', 'MTN MoMo NG', 'MTN Mobile Money Nigeria', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000017', 'Virement bancaire NG', 'Virement bancaire Nigeria (GTB, Access, Zenith…)', 'BankTransfer', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000018', 'MTN MoMo GH', 'MTN Mobile Money Ghana', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000019', 'Vodafone Cash GH', 'Vodafone Cash Ghana', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000020', 'AirtelTigo Money GH', 'AirtelTigo Money Ghana', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000021', 'Orange Money GN', 'Orange Money Guinée-Conakry', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000022', 'MTN MoMo GN', 'MTN Mobile Money Guinée', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000023', 'Orange Money SL', 'Orange Money Sierra Leone', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000024', 'Africell Money SL', 'Africell Money Sierra Leone', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000025', 'MTN MoMo LR', 'MTN Mobile Money Libéria', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000026', 'QMoney GM', 'QMoney Gambie', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000027', 'Airtel Money CD', 'Airtel Money RD Congo', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000028', 'M-Pesa CD', 'M-Pesa RD Congo (Vodacom)', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000029', 'Orange Money CD', 'Orange Money RD Congo', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000030', 'Wave BF', 'Wave Burkina Faso', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000031', 'Orange Money BF', 'Orange Money Burkina Faso', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000032', 'Moov Money BF', 'Moov Money Burkina Faso', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000033', 'Orange Money NE', 'Orange Money Niger', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000034', 'Airtel Money NE', 'Airtel Money Niger', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000035', 'T-Money TG', 'T-Money Togo (Togocel)', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000036', 'Moov Money TG', 'Moov Money Togo', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000037', 'MTN MoMo BJ', 'MTN Mobile Money Bénin', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000038', 'Moov Money BJ', 'Moov Money Bénin', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000039', 'Orange Money GW', 'Orange Money Guinée-Bissau', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000040', 'MTN MoMo CG', 'MTN Mobile Money Congo-Brazzaville', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000041', 'Airtel Money CG', 'Airtel Money Congo-Brazzaville', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000042', 'Airtel Money GA', 'Airtel Money Gabon', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000043', 'Moov Money GA', 'Moov Money Gabon', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000044', 'Orange Money CF', 'Orange Money Centrafrique', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000045', 'Airtel Money CF', 'Airtel Money Centrafrique', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000046', 'MTN MoMo GQ', 'MTN Mobile Money Guinée Équatoriale', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000047', 'Airtel Money TD', 'Airtel Money Tchad', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000048', 'Moov Money TD', 'Moov Money Tchad', 'MobileMoney', NULL, true);
INSERT INTO public."PaymentMethods" ("Id", "Name", "Description", "Type", "LogoUrl", "IsActive") VALUES ('10000000-0000-0000-0000-000000000049', 'Africell Money GM', 'Africell Money Gambie', 'MobileMoney', NULL, true);


--
-- Data for Name: CountryPaymentMethods; Type: TABLE DATA; Schema: public; Owner: simplexpay
--

INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BF', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BJ', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CA', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CA', '10000000-0000-0000-0000-000000000002', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CA', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CF', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CG', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000004', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000007', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000008', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CI', '10000000-0000-0000-0000-000000000009', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CM', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CM', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CM', '10000000-0000-0000-0000-000000000010', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CM', '10000000-0000-0000-0000-000000000011', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GA', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GQ', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GW', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ML', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ML', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ML', '10000000-0000-0000-0000-000000000012', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ML', '10000000-0000-0000-0000-000000000013', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NE', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SN', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SN', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SN', '10000000-0000-0000-0000-000000000004', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SN', '10000000-0000-0000-0000-000000000005', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SN', '10000000-0000-0000-0000-000000000006', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TD', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TG', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TG', '10000000-0000-0000-0000-000000000004', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GH', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GH', '10000000-0000-0000-0000-000000000018', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GH', '10000000-0000-0000-0000-000000000019', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GH', '10000000-0000-0000-0000-000000000020', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NG', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NG', '10000000-0000-0000-0000-000000000014', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NG', '10000000-0000-0000-0000-000000000015', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NG', '10000000-0000-0000-0000-000000000016', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NG', '10000000-0000-0000-0000-000000000017', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GN', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GN', '10000000-0000-0000-0000-000000000021', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GN', '10000000-0000-0000-0000-000000000022', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SL', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SL', '10000000-0000-0000-0000-000000000023', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('SL', '10000000-0000-0000-0000-000000000024', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('LR', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('LR', '10000000-0000-0000-0000-000000000025', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GM', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GM', '10000000-0000-0000-0000-000000000026', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CV', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CV', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CD', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CD', '10000000-0000-0000-0000-000000000027', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CD', '10000000-0000-0000-0000-000000000028', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CD', '10000000-0000-0000-0000-000000000029', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ST', '10000000-0000-0000-0000-000000000001', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('ST', '10000000-0000-0000-0000-000000000003', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BF', '10000000-0000-0000-0000-000000000030', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BF', '10000000-0000-0000-0000-000000000031', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BF', '10000000-0000-0000-0000-000000000032', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NE', '10000000-0000-0000-0000-000000000033', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('NE', '10000000-0000-0000-0000-000000000034', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TG', '10000000-0000-0000-0000-000000000035', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TG', '10000000-0000-0000-0000-000000000036', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BJ', '10000000-0000-0000-0000-000000000037', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('BJ', '10000000-0000-0000-0000-000000000038', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GW', '10000000-0000-0000-0000-000000000039', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CG', '10000000-0000-0000-0000-000000000040', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CG', '10000000-0000-0000-0000-000000000041', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GA', '10000000-0000-0000-0000-000000000042', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GA', '10000000-0000-0000-0000-000000000043', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CF', '10000000-0000-0000-0000-000000000044', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('CF', '10000000-0000-0000-0000-000000000045', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GQ', '10000000-0000-0000-0000-000000000046', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TD', '10000000-0000-0000-0000-000000000047', true);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('TD', '10000000-0000-0000-0000-000000000048', false);
INSERT INTO public."CountryPaymentMethods" ("CountryCode", "PaymentMethodId", "IsPopular") VALUES ('GM', '10000000-0000-0000-0000-000000000049', false);


--
-- PostgreSQL database dump complete
--

\unrestrict UlNjMQTNK1fsmYVTW4bVaJu342KKpY3agkp7r0INuDlXhAbFkpbhMWRShX04bH7

