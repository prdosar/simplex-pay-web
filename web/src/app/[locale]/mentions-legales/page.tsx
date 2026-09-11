import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales · SimplexPay',
}

const CONTENT_FR = {
  title: 'Mentions légales',
  updated: 'Dernière mise à jour : 11 septembre 2026',
  sections: [
    {
      title: 'Éditeur du site',
      body: [
        "Le site simplex-pay.com (ci-après « SimplexPay » ou « la Plateforme ») est édité par Simplex Tech.",
        "Contact : noreply@simplex-pay.com",
      ],
    },
    {
      title: 'Hébergement',
      body: [
        "Le site est hébergé sur une infrastructure Cloud. Les emails transactionnels sont acheminés via OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.",
      ],
    },
    {
      title: 'Objet de la Plateforme',
      body: [
        "SimplexPay est une plateforme de mise en relation entre particuliers de la diaspora africaine autour de trois catégories de services : échange de devises, transport de kilos lors de voyages, et expédition maritime de fret.",
        "SimplexPay n'est ni une banque, ni un établissement de paiement, ni un opérateur de transport. La Plateforme ne détient aucun fonds, ne traite aucune transaction financière et n'intervient à aucun moment dans l'exécution des échanges convenus entre utilisateurs.",
      ],
    },
    {
      title: 'Responsabilité',
      body: [
        "Les offres publiées le sont sous la seule responsabilité de leurs auteurs. SimplexPay ne garantit ni l'exactitude, ni la véracité, ni la qualité des offres et des utilisateurs qui les publient.",
        "Les échanges se déroulent directement entre particuliers, en dehors de la Plateforme. SimplexPay ne saurait être tenue responsable des pertes, litiges, fraudes ou dommages, directs ou indirects, résultant d'une interaction entre utilisateurs.",
        "Il appartient à chaque utilisateur de vérifier l'identité, la réputation et les avis d'un autre utilisateur avant de conclure un accord ou d'effectuer tout paiement.",
      ],
    },
    {
      title: 'Propriété intellectuelle',
      body: [
        "L'ensemble des éléments constitutifs du site (marque, logo, textes, illustrations, code source) sont la propriété exclusive de Simplex Tech ou de leurs ayants droit respectifs.",
        "Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable, est interdite.",
      ],
    },
    {
      title: 'Données personnelles',
      body: [
        "Les données collectées lors de l'inscription et de l'utilisation du service sont traitées conformément à la Politique de confidentialité.",
        "Chaque utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en écrivant à noreply@simplex-pay.com.",
      ],
    },
    {
      title: 'Contact',
      body: [
        "Pour toute question relative aux présentes mentions légales : noreply@simplex-pay.com",
      ],
    },
  ],
}

const CONTENT_EN: typeof CONTENT_FR = {
  title: 'Legal notices',
  updated: 'Last updated: September 11, 2026',
  sections: [
    {
      title: 'Publisher',
      body: [
        'The website simplex-pay.com (hereinafter "SimplexPay" or "the Platform") is published by Simplex Tech.',
        'Contact: noreply@simplex-pay.com',
      ],
    },
    {
      title: 'Hosting',
      body: [
        'The site is hosted on cloud infrastructure. Transactional emails are relayed through OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.',
      ],
    },
    {
      title: 'Purpose of the Platform',
      body: [
        'SimplexPay is a matchmaking platform for individuals of the African diaspora around three categories: currency exchange, travel-kilo shipping, and sea freight.',
        'SimplexPay is not a bank, payment institution, or transport operator. The Platform holds no funds, processes no financial transaction and does not intervene in the execution of exchanges agreed between users.',
      ],
    },
    {
      title: 'Liability',
      body: [
        'Offers are published under the sole responsibility of their authors. SimplexPay makes no warranty as to the accuracy, truthfulness or quality of the offers or the users who publish them.',
        'Exchanges take place directly between individuals, outside the Platform. SimplexPay may not be held liable for any loss, dispute, fraud or damage, direct or indirect, resulting from an interaction between users.',
        'It is the responsibility of each user to verify the identity, reputation and reviews of another user before entering into any agreement or making any payment.',
      ],
    },
    {
      title: 'Intellectual property',
      body: [
        'All elements of the site (brand, logo, texts, illustrations, source code) are the exclusive property of Simplex Tech or their respective rights holders.',
        'Any reproduction or representation, total or partial, without prior written authorization is prohibited.',
      ],
    },
    {
      title: 'Personal data',
      body: [
        'Data collected during registration and use of the service is processed in accordance with the Privacy Policy.',
        'Each user has a right of access, rectification and deletion of their data by writing to noreply@simplex-pay.com.',
      ],
    },
    {
      title: 'Contact',
      body: [
        'For any question relating to these legal notices: noreply@simplex-pay.com',
      ],
    },
  ],
}

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const content = locale === 'en' ? CONTENT_EN : CONTENT_FR

  return (
    <div style={{ background: '#ffffff', color: '#0f172a' }} className="py-16 px-6">
      <div className="max-w-[820px] mx-auto">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-[-0.02em] mb-3">
          {content.title}
        </h1>
        <p className="text-sm mb-12" style={{ color: '#64748b' }}>{content.updated}</p>

        <div className="space-y-10">
          {content.sections.map(section => (
            <section key={section.title}>
              <h2 className="text-xl font-extrabold mb-3" style={{ color: '#0f172a' }}>
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-[15px] leading-relaxed" style={{ color: '#334155' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
