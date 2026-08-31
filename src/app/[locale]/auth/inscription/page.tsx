import { getCountries } from '@/lib/queries'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const countries = await getCountries()
  return <RegisterForm countries={countries} />
}
