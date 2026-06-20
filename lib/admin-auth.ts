import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export function requireAuth() {
  if (!isAuthenticated()) {
    redirect('/admin/login')
  }
}

export function isAuthenticated() {
  return cookies().get('spazio_admin_session')?.value === 'authenticated'
}
