import HomeClient from './HomeClient'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <HomeClient locale={locale} />
}
