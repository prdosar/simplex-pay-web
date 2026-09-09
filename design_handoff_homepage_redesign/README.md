# Handoff: SimplexPay — Refonte de la page d'accueil (Offres + filtres)

## Overview
Refonte visuelle et fonctionnelle de la page d'accueil de SimplexPay : hero, bande de devises, section "Offres" avec barre de recherche + filtres (pays, moyen de paiement, montant min/max, tri), "Comment ça marche", section confiance, CTA et footer.

## About the Design Files
Le fichier de ce dossier (`SimplexPay - Accueil.dc.html`) est une **référence de design en HTML** — un prototype qui montre le look et le comportement voulus, pas du code à copier tel quel. La tâche pour Claude Code : **recréer ce design dans le code existant** — Next.js (App Router) + Tailwind CSS v4 + next-intl, tel qu'il existe déjà dans `web/`. Réutiliser les patterns existants (`HomeClient.tsx`, `Navbar.tsx`, `OfferCard.tsx`, `globals.css`, l'API `/api/offers`, `/api/countries`) plutôt que de repartir de zéro.

## Fidelity
**High-fidelity.** Couleurs, typographie, espacements et layout du prototype sont finaux. Les données (offres, pays, taux) dans le prototype sont des exemples statiques — en prod elles doivent venir de l'API existante (`useSWR` vers `/api/offers`, `/api/countries`) comme le fait déjà `HomeClient.tsx`.

## Screens / Views

### 1. Nav
Barre sticky blanche, bordure basse `#e2e8f0`, hauteur 72px. Logo "Simplex" (teal `#0d9488`) + "Pay" (`#0f172a`), liens "Offres" / "Comment ça marche", bouton EN, "Connexion", bouton "Inscription" (fond teal, texte blanc, radius 10px). Correspond à `Navbar.tsx` existant — juste resserrer les styles.

### 2. Hero
Layout split (texte à gauche, carte d'offre exemple à droite). Titre 52px/800, sous-titre 18px `#475569` max-width 520px. Deux CTA : "Voir les offres" (plein teal) + "Publier une offre" (outline). Rangée de 3 points de confiance avec coche circulaire teal. Carte à droite : mockup d'offre CAD→XOF avec barre de dégradé teal→orange en haut, taux en gros, dispo/min/max, profil vendeur.

### 3. Bande devises
Bande grise `#f8fafc`, chips "CAD ↔ [drapeau] [code]" pour XOF (Sénégal + Togo), XAF, NGN, GHS. Drapeaux = images `https://flagcdn.com/24x18/{code-iso2}.png` (pas d'emoji).

### 4. Section Offres (le plus important — ordre : **avant** "Comment ça marche")
- Barre de recherche pleine largeur avec icône loupe, placeholder "Rechercher un vendeur…", badge pays sélectionné à droite dans le champ (drapeau + nom + devise).
- Sidebar de filtres (260px, carte blanche bordée, radius 16px) :
  - **Pays vendeur** : select obligatoire (pas d'option "Tous les pays"), pays = Togo par défaut.
  - **Trier par** : select — "Plus récentes" / "Meilleur taux ↓" / "Taux croissant ↑".
  - **Moyen de paiement** : boutons liste dépendants du pays choisi (ex. Togo → Flooz, T-Money, Virement bancaire), "Tous les modes" en tête. Message "Sélectionnez un pays" si aucun pays.
  - **Montant disponible** : deux inputs number Min / Max côte à côte.
  - Bouton "Effacer les filtres (n)" si des filtres actifs (pays exclu du compte puisqu'il est obligatoire).
- Grille de résultats `repeat(auto-fill, minmax(280px,1fr))`, cartes d'offre (drapeaux from/to, taux en gros teal, dispo/min-max, chips moyens de paiement, ligne vendeur avec avatar initiale + note + cadenas si non connecté).
- État vide : message + lien "Effacer les filtres".

### 5. Comment ça marche
3 cartes numérotées (01/02/03, badge outline teal), titre + description courte.

### 6. Pourquoi SimplexPay
Grille de 4 items (icône carrée teal-light, titre, description).

### 7. CTA banner
Fond `#0f766e`, titre blanc, bouton blanc texte teal.

### 8. Footer
Fond `#0f172a`, 4 colonnes (logo+tagline, Produit, Compte, Légal), bas de page avec copyright + toggle EN.

## Interactions & Behavior
- Recherche : filtre les offres par nom de vendeur (insensible à la casse), en direct (onChange), pas besoin de bouton "Chercher" séparé dans cette version.
- Sélection pays : change la liste de moyens de paiement disponible et réinitialise le filtre moyen de paiement sélectionné.
- Filtres se combinent (ET logique) : recherche + pays + moyen de paiement + montant min/max.
- Tri : "Plus récentes" (ordre par défaut) / "Meilleur taux ↓" / "Taux croissant ↑" (tri numérique sur le taux).
- Reset : remet recherche/moyen de paiement/montants/tri à vide, garde le pays sélectionné (Togo par défaut) car il est obligatoire.
- Compteur de résultats affiché près de la barre de recherche ("N offre(s)").

## State Management
Équivalent à ajouter dans `HomeClient.tsx` (qui a déjà `sellCountry`, `paymentMethodId`, `minAmount`, `maxAmount`, `sort`, `search` — c'est très proche de l'existant) :
- `search: string`
- `country: string` (default `'TG'`, jamais vide)
- `paymentMethodId: string`
- `minAmount`, `maxAmount: string`
- `sort: 'recent' | 'rate_desc' | 'rate_asc'`
- Dériver `activeCount` (hors pays), `selectedCountry`, `selectedCountryMethods` depuis `countries` (déjà chargé via `/api/countries`).

Différences à appliquer par rapport à `HomeClient.tsx` actuel :
1. Rendre le champ pays **obligatoire** (retirer l'option "Tous les pays", défaut = Togo).
2. Afficher un badge drapeau+pays dans la barre de recherche (au lieu du badge actuel qui n'apparaît que si un pays est choisi — il doit toujours être visible).
3. Déplacer le contrôle de tri dans la sidebar de filtres (actuellement il l'est déjà — vérifier l'ordre pays → tri → moyen de paiement → montant).
4. Remplacer tous les emoji drapeaux (`c.flag`) par des `<img src="https://flagcdn.com/24x18/{iso2}.png">` — dans le select ce n'est pas possible nativement (garder le texte), mais partout ailleurs (badge recherche, cartes d'offre, bande devises, hero) utiliser l'image.
5. Réordonner les sections de la page d'accueil : **Offres avant "Comment ça marche"**.

## Design Tokens
- `--color-primary: #0d9488` / `--color-primary-dark: #0f766e` / `--color-primary-light: #ccfbf1`
- `--color-secondary (accent orange): #f97316`
- `--color-foreground: #0f172a` / `--color-muted-foreground: #64748b`
- `--color-border: #e2e8f0` / `--color-muted: #f8fafc` / `--color-background: #ffffff`
- Font: Inter (400/500/600/700/800)
- Radius: cartes 16px, boutons/inputs 8–12px, chips 100px (pill)
- Ces tokens existent déjà dans `web/src/app/globals.css` — ne pas en créer de nouveaux, les réutiliser via les classes `text-[--color-primary]` etc.

## Assets
- Drapeaux : `https://flagcdn.com/24x18/{iso2}.png` (ex. `tg`, `sn`, `cm`, `ng`, `gh`, `ca`) — CDN public, pas de fichier à héberger.
- Aucune autre image/icône externe.

## i18n keys — additions required (fixes raw keys showing on screen)
La première implémentation affichait des clés brutes (`home.hero.badge`, `nav.howItWorks`, `home.hero.ctaView`, `home.hero.trust1/2/3`, `home.offers.sectionTitle`…) au lieu du texte traduit : les clés ont été inventées mais pas ajoutées aux fichiers de traduction, et certaines dupliquent des clés existantes. Deux règles :
1. **Réutiliser les clés existantes** — ne pas créer `home.hero.ctaView`, utiliser `home.hero.cta` (déjà = "Voir les offres"). Pareil pour `nav.offers`, `home.hero.ctaPost`, `home.howItWorks.title`/`step1`/`step2`/`step3`.
2. **Ajouter seulement les clés vraiment nouvelles**, dans `messages/fr.json` et `messages/en.json` :

```json
// fr.json — à fusionner dans les objets existants
"nav": { "howItWorks": "Comment ça marche" },
"home": {
  "hero": {
    "badge": "Plateforme P2P · Diaspora africaine au Canada",
    "trust1": "Inscription gratuite",
    "trust2": "Paiement direct, sans frais cachés",
    "trust3": "Profils et avis vérifiés"
  },
  "offers": {
    "sectionTitle": "Offres en ce moment",
    "sectionSubtitle": "Un aperçu des échanges proposés par la communauté",
    "viewAll": "Voir toutes les offres",
    "resultCount": "{count} offre(s)"
  }
},
"offers": {
  "filters": {
    "sortBy": "Trier par",
    "sortRecent": "Plus récentes",
    "sortRateDesc": "Meilleur taux ↓",
    "sortRateAsc": "Taux croissant ↑",
    "paymentMethod": "Moyen de paiement",
    "allMethods": "Tous les modes",
    "selectCountryFirst": "Sélectionnez un pays",
    "minAmount": "Min",
    "maxAmount": "Max",
    "clear": "Effacer les filtres",
    "noResults": "Aucune offre ne correspond à ces critères."
  }
}
```

```json
// en.json — équivalent anglais
"nav": { "howItWorks": "How it works" },
"home": {
  "hero": {
    "badge": "P2P platform · African diaspora in Canada",
    "trust1": "Free to join",
    "trust2": "Direct payment, no hidden fees",
    "trust3": "Verified profiles and reviews"
  },
  "offers": {
    "sectionTitle": "Offers right now",
    "sectionSubtitle": "A look at the exchanges offered by the community",
    "viewAll": "View all offers",
    "resultCount": "{count} offer(s)"
  }
},
"offers": {
  "filters": {
    "sortBy": "Sort by",
    "sortRecent": "Most recent",
    "sortRateDesc": "Best rate ↓",
    "sortRateAsc": "Rate ascending ↑",
    "paymentMethod": "Payment method",
    "allMethods": "All methods",
    "selectCountryFirst": "Select a country first",
    "minAmount": "Min",
    "maxAmount": "Max",
    "clear": "Clear filters",
    "noResults": "No offers match these criteria."
  }
}
```

Avant de livrer : grep le code rendu pour toute chaîne contenant un `.` en camelCase brut (ex. `home.hero.badge`) affichée à l'écran — c'est le signe d'une clé manquante ou mal résolue par `next-intl`.

## Files
- `SimplexPay - Accueil.dc.html` (ce dossier) : prototype complet à recréer.
- Fichiers du code cible à modifier dans `web/` :
  - `src/app/[locale]/HomeClient.tsx` (page d'accueil + logique de filtres/tri/recherche — la plus proche du prototype)
  - `src/components/offers/OfferCard.tsx` (ajouter les chips moyens de paiement + drapeaux image)
  - `src/components/layout/Navbar.tsx` (probablement inchangé, juste vérifier les styles)
  - `src/app/globals.css` (tokens déjà présents, ne pas dupliquer)
  - `messages/fr.json` / `messages/en.json` (ajouter les clés manquantes : tri, "Sélectionnez un pays", "Tous les modes", etc.)
