'use client'

import { useState } from 'react'
import { sendOtp, verifyOtp } from '@/app/auth/actions'

export function PhoneAuth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    const result = await sendOtp(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setStep('otp')
    }
  }

  const handleVerifyOtp = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    // Append phone to formData since it's needed for verification but might not be in the OTP form
    formData.append('phone', phone)
    
    // Server action will redirect on success
    const result = await verifyOtp(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-center text-sm font-medium text-gray-500 mb-4">Or sign in with Phone</h3>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form action={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              autoComplete="tel"
              placeholder="+1234567890" // International format hint
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Sending Code...' : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form action={handleVerifyOtp} className="space-y-4">
          <div className="text-sm text-center text-gray-600 mb-2">
            Code sent to <span className="font-medium">{phone}</span>
          </div>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">Enter SMS Code</label>
            <input
              type="text"
              name="token"
              id="token"
              required
              autoComplete="one-time-code"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-2">
             <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Back
             </button>
             <button
                type="submit"
                disabled={loading}
                className="flex-[2] w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
             </button>
          </div>
        </form>
      )}
    </div>
  )
}
