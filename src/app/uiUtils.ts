import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const checkAuth = async (router: AppRouterInstance) => {
    try {
      // const response = await fetch('/api/auth/check')
      const response = await fetch('/api/auth/check',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )
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
        console.log('isAuthenticated 1')
        const response = await fetch('/api/auth/check',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        )
        console.log('isAuthenticated 2')
        const data = await response.json()
        console.log('isAuthenticated 3',data)
        if (!data.authenticated) {
          return false
        }
      } catch (error) {
        return false
      }
      return true
}