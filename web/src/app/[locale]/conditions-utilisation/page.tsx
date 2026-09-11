import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'utilisation · SimplexPay",
}

const CONTENT_FR = {
  title: "Conditions d'utilisation",
  updated: 'Dernière mise à jour : 11 septembre 2026',
  intro:
    "Les présentes conditions d'utilisation (« CGU ») régissent l'accès à la plateforme SimplexPay et son utilisation par tout visiteur ou membre inscrit. En utilisant SimplexPay, vous acceptez les CGU sans réserve.",
  sections: [
    {
      title: '1. Nature du service',
      body: [
        "SimplexPay est une plateforme de mise en relation entre particuliers. Elle permet à ses utilisateurs de publier et de consulter des offres dans trois catégories : échange de devises, transport de kilos lors de voyages, et fret maritime.",
        "SimplexPay n'est pas partie aux transactions conclues entre utilisateurs. Aucun paiement, aucune remise de fonds ou de bien ne transite par la Plateforme. Toutes les transactions se font directement entre les particuliers, hors du site.",
      ],
    },
    {
      title: '2. Inscription et compte utilisateur',
      body: [
        "L'inscription est gratuite et ouverte à toute personne majeure. Chaque utilisateur s'engage à fournir des informations exactes et à les tenir à jour.",
        "L'accès à certaines fonctionnalités (publier une offre, contacter un autre membre, laisser un avis) requiert la vérification de l'adresse e-mail.",
        "L'utilisateur est seul responsable de la confidentialité de son mot de passe et des activités effectuées depuis son compte.",
      ],
    },
    {
      title: '3. Règles de publication',
      body: [
        "Toute offre publiée doit être sincère, exacte, et conforme à la législation applicable. Sont notamment interdits : les offres frauduleuses, les biens ou services illicites, les contenus haineux, diffamatoires ou trompeurs.",
        "SimplexPay se réserve le droit de suspendre ou supprimer, sans préavis, toute offre ou tout compte qui contreviendrait aux présentes CGU.",
      ],
    },
    {
      title: '4. Responsabilité des utilisateurs',
      body: [
        "Chaque utilisateur assume l'entière responsabilité des offres qu'il publie et des transactions qu'il conclut. Il lui appartient de vérifier l'identité, la solvabilité, la fiabilité et les avis de son interlocuteur avant tout engagement ou paiement.",
        "SimplexPay recommande à ses utilisateurs de privilégier les échanges avec des membres vérifiés ou certifiés et de ne jamais transmettre de fonds sans avoir sécurisé l'exécution de la contrepartie.",
      ],
    },
    {
      title: '5. Absence de responsabilité de SimplexPay',
      body: [
        "SimplexPay n'intervient à aucun moment dans les échanges entre utilisateurs et ne peut être tenue responsable :",
        "— des offres publiées par les utilisateurs, de leur véracité, de leur exactitude ou de leur exécution ;",
        "— des paiements, transferts, livraisons ou prestations effectués en dehors de la Plateforme ;",
        "— des différends, litiges, fraudes, pertes ou dommages, directs ou indirects, résultant d'une interaction entre utilisateurs ;",
        "— du comportement, de l'identité réelle ou des intentions d'un utilisateur.",
        "SimplexPay ne fournit aucune garantie sur la disponibilité du service et se réserve le droit de le modifier, de le suspendre ou d'y mettre fin à tout moment.",
      ],
    },
    {
      title: '6. Avis et évaluations',
      body: [
        "Tout membre vérifié peut noter un autre utilisateur avec lequel il a interagi. Les avis doivent être honnêtes, factuels et respectueux. Un avis par paire d'utilisateurs est autorisé (mise à jour possible).",
        "Les avis mensongers, insultants ou dénués de fondement pourront être retirés.",
      ],
    },
    {
      title: '7. Propriété intellectuelle',
      body: [
        "L'ensemble des éléments constitutifs du site est protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.",
      ],
    },
    {
      title: '8. Modification des CGU',
      body: [
        "SimplexPay peut modifier les présentes CGU à tout moment. La version en vigueur est celle publiée sur la Plateforme. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.",
      ],
    },
    {
      title: '9. Droit applicable',
      body: [
        "Les présentes CGU sont régies par le droit applicable au lieu d'établissement de l'éditeur. Tout différend sera, à défaut de résolution amiable, soumis à la juridiction compétente.",
      ],
    },
    {
      title: '10. Contact',
      body: [
        'Pour toute question relative aux présentes CGU : noreply@simplex-pay.com',
      ],
    },
  ],
}

const CONTENT_EN: typeof CONTENT_FR = {
  title: 'Terms of use',
  updated: 'Last updated: September 11, 2026',
  intro:
    'These terms of use ("ToU") govern access to and use of the SimplexPay platform by any visitor or registered member. By using SimplexPay, you accept the ToU without reservation.',
  sections: [
    {
      title: '1. Nature of the service',
      body: [
        'SimplexPay is a matchmaking platform between individuals. It allows its users to publish and browse offers in three categories: currency exchange, travel-kilo shipping, and sea freight.',
        'SimplexPay is not a party to transactions concluded between users. No payment, funds or goods transit through the Platform. All transactions take place directly between individuals, outside the site.',
      ],
    },
    {
      title: '2. Registration and user account',
      body: [
        'Registration is free and open to any adult person. Each user undertakes to provide accurate information and keep it up to date.',
        'Access to certain features (posting an offer, contacting another member, leaving a review) requires email verification.',
        'The user is solely responsible for the confidentiality of their password and for activity carried out from their account.',
      ],
    },
    {
      title: '3. Posting rules',
      body: [
        'Any offer posted must be sincere, accurate and comply with applicable legislation. The following are notably prohibited: fraudulent offers, illicit goods or services, hateful, defamatory or misleading content.',
        'SimplexPay reserves the right to suspend or delete, without notice, any offer or account that violates these ToU.',
      ],
    },
    {
      title: '4. User responsibility',
      body: [
        'Each user assumes full responsibility for the offers they publish and the transactions they conclude. It is their responsibility to verify the identity, solvency, reliability and reviews of their counterparty before any commitment or payment.',
        'SimplexPay recommends favoring exchanges with verified or certified members and never transferring funds without securing the counterparty performance.',
      ],
    },
    {
      title: '5. SimplexPay disclaimer',
      body: [
        'SimplexPay does not intervene at any time in exchanges between users and may not be held liable:',
        '— for offers posted by users, their truthfulness, accuracy or execution;',
        '— for payments, transfers, deliveries or services carried out outside the Platform;',
        '— for disputes, litigation, fraud, losses or damages, direct or indirect, resulting from an interaction between users;',
        '— for the behavior, real identity or intentions of a user.',
        'SimplexPay makes no warranty as to service availability and reserves the right to modify, suspend or discontinue it at any time.',
      ],
    },
    {
      title: '6. Reviews and ratings',
      body: [
        'Any verified member may rate another user with whom they have interacted. Reviews must be honest, factual and respectful. One review per pair of users is allowed (update possible).',
        'Untruthful, insulting or baseless reviews may be removed.',
      ],
    },
    {
      title: '7. Intellectual property',
      body: [
        'All elements of the site are protected by intellectual property law. Any unauthorized reproduction is prohibited.',
      ],
    },
    {
      title: '8. Amendment of the ToU',
      body: [
        'SimplexPay may modify these ToU at any time. The version in force is the one published on the Platform. Continued use of the service after modification constitutes acceptance of the new terms.',
      ],
    },
    {
      title: '9. Applicable law',
      body: [
        'These ToU are governed by the law applicable at the place of establishment of the publisher. Any dispute will, failing amicable resolution, be submitted to the competent jurisdiction.',
      ],
    },
    {
      title: '10. Contact',
      body: [
        'For any question relating to these ToU: noreply@simplex-pay.com',
      ],
    },
  ],
}

export default async function TermsPage({
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
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>{content.updated}</p>

        <p className="text-[15px] leading-relaxed mb-12 p-5 rounded-2xl"
           style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
          {content.intro}
        </p>

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
