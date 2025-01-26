import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const checkAuth = async (router: AppRouterInstance) => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      
      if (!data.authenticated) {
        router.push('/login')
        router.refresh()
    }
    } catch (error) {
      router.push('/login')
      router.refresh()
    }
  }
  
export const isAuthenticated = async() => {
    try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        console.log('data',data)
        if (!data.authenticated) {
          return false
        }
      } catch (error) {
        return false
      }
      return true
}