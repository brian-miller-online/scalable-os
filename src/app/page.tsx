import { redirect } from 'next/navigation'

export default function Home() {
  // TODO: Check auth + onboarding status (Task 2)
  // For now, redirect to login
  redirect('/login')
}
