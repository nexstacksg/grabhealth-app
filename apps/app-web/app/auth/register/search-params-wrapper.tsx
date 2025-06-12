"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import RegisterForm from "./register-form"

export default function SearchParamsWrapper() {
  const searchParams = useSearchParams()
  const [referrerId, setReferrerId] = useState<string | null>(null)
  
  // Extract referrer ID from URL parameters
  useEffect(() => {
    const referrer = searchParams.get('referrer')
    if (referrer) {
      setReferrerId(referrer)
    }
  }, [searchParams])

  return <RegisterForm referrerId={referrerId} />
}
