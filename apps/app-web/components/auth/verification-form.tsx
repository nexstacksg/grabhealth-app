"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface VerificationFormProps {
  email: string
  verificationType?: 'login' | 'registration' | 'password_reset'
  onSuccess?: () => void
}

export function VerificationForm({ email, verificationType = 'login', onSuccess }: VerificationFormProps) {
  const [code, setCode] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (index === 3 && value && newCode.every(digit => digit)) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 4)
    
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('')
      const newCode = [...code]
      
      digits.forEach((digit, index) => {
        if (index < 4) {
          newCode[index] = digit
        }
      })
      
      setCode(newCode)
      
      // Focus last input or submit if complete
      if (digits.length === 4) {
        handleSubmit(newCode.join(''))
      } else {
        inputRefs.current[Math.min(digits.length, 3)]?.focus()
      }
    }
  }

  const handleSubmit = async (codeString?: string) => {
    const verificationCode = codeString || code.join('')
    
    if (verificationCode.length !== 4) {
      toast.error("Please enter all 4 digits")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode,
          type: verificationType
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Verification successful!")
        
        if (verificationType === 'login') {
          router.push('/dashboard')
        } else if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(data.message || "Invalid verification code")
        setCode(['', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.error('Verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: verificationType
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("New verification code sent!")
        setCode(['', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        toast.error(data.message || "Failed to resend code")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.error('Resend error:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We've sent a 4-digit verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-14 h-14 text-center text-2xl font-semibold"
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <Button
          onClick={() => handleSubmit()}
          disabled={loading || code.some(digit => !digit)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Didn't receive the code? </span>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={resending}
            className="p-0 h-auto"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}