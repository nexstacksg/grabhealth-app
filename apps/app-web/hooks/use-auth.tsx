"use client"

import { createContext, useContext, useEffect, useState } from "react"

// Define user type to match the one in lib/auth.ts
export interface User {
  id: number
  name: string
  email: string
  created_at?: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current user on mount
  useEffect(() => {
    refreshUser()
  }, [])

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/me")
      
      if (response.status === 401) {
        setUser(null)
        return
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      console.error("Error fetching user:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }
      
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Signup failed")
      }
      
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      console.error("Signup error:", err)
      setError(err instanceof Error ? err.message : "Signup failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Logout failed")
      }
      
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Auth context value
  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}
