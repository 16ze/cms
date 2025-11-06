/**
 * Hook pour récupérer les informations de l'utilisateur admin connecté
 * Remplace l'ancien hook use-temp-admin.ts
 */

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
  tenantSlug?: string
}

export function useAdminSession() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function checkSession() {
      try {
        console.log('🔍 [useAdminSession] Vérification de la session...')

        // Vérifier la session en appelant l'API /api/auth/me
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Important pour inclure les cookies
        })

        console.log('🔍 [useAdminSession] Réponse API:', response.status, response.statusText)

        // Ignorer les erreurs 401/403 (utilisateur non connecté)
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.log('ℹ️ [useAdminSession] Utilisateur non authentifié')
            setUser(null)
            setLoading(false)
            return
          }
          // Autres erreurs HTTP
          console.error('❌ [useAdminSession] Erreur HTTP:', response.status)
          setUser(null)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('🔍 [useAdminSession] Données reçues:', data)

        if (data.success && data.user) {
          console.log('✅ [useAdminSession] Utilisateur authentifié:', data.user)

          const userData = {
            id: data.user.id,
            name: data.user.name || data.user.email.split('@')[0] || 'Admin',
            email: data.user.email,
            role: data.user.type === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'TENANT_ADMIN',
            tenantId: data.user.tenantId,
            tenantSlug: data.user.tenantSlug,
          }

          setUser(userData)

          // Redirection basée sur le rôle (seulement si nécessaire)
          if (data.user.type === 'TENANT_ADMIN') {
            console.log('🔄 [useAdminSession] Utilisateur tenant détecté, page actuelle:', pathname)
            // Rediriger seulement si on n'est pas déjà sur une page admin tenant
            if (pathname && !pathname.startsWith('/admin/') && pathname !== '/login') {
              console.log('🔄 [useAdminSession] Redirection vers dashboard tenant')
              router.push('/admin/dashboard')
            }
          } else if (data.user.type === 'SUPER_ADMIN') {
            console.log('🔄 [useAdminSession] Super admin détecté, page actuelle:', pathname)
            // Rediriger seulement si on n'est pas déjà sur une page super-admin
            if (
              pathname &&
              !pathname.startsWith('/super-admin/') &&
              pathname !== '/super-admin/login'
            ) {
              console.log('🔄 [useAdminSession] Redirection vers dashboard super-admin')
              router.push('/super-admin/dashboard')
            }
          }
        } else {
          console.log(
            '❌ [useAdminSession] Pas authentifié (data.success:',
            data.success,
            ', data.user:',
            !!data.user,
            ')'
          )
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de session:', error)
        // En cas d'erreur, ne pas rediriger automatiquement
        // La redirection sera gérée par les composants qui utilisent ce hook
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router, pathname])

  return { user, loading }
}
