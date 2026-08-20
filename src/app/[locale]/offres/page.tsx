import { redirect } from 'next/navigation'

export default async function OffresPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}`)
}
