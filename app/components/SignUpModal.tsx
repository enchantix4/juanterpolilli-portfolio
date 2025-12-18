'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import DraggableWindow from './DraggableWindow'
import { countries } from '@/data/countries'

import { useColors } from '../hooks/useColors'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  zIndex?: number
  onFocus?: () => void
  title?: string
  colors?: ReturnType<typeof useColors>['colors']
}

interface FormData {
  email: string
  country: string
}

export default function SignUpModal({ isOpen, onClose, zIndex, onFocus, title = 'SIGN UP', colors: colorsProp }: SignUpModalProps) {
  const { colors: defaultColors } = useColors()
  const colors = colorsProp || defaultColors
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setUserEmail(data.email)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting email:', error)
    }
  }

  if (isSubmitted) {
    return (
      <DraggableWindow
        id="signup-thanks"
        isOpen={isOpen}
        onClose={onClose}
        title="Thank You!"
        initialPosition={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (typeof window !== 'undefined' ? window.innerWidth / 2 - 250 : 250), y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 200 }}
        initialSize={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : 500, height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : 400 }}
        zIndex={zIndex}
        onFocus={onFocus}
        colors={colors}
      >
        <div className="text-center py-8">
          <p className="text-lg font-bold mb-4 uppercase tracking-tight text-white">Thank you for signing up!</p>
          <p className="text-sm mb-4 leading-relaxed text-gray-300">
            We have sent a confirmation email to <strong className="text-white">{userEmail}</strong>. Click the link to confirm your email address.
          </p>
          <p className="text-xs mb-4 text-gray-400">
            Please check your spam folder for the email, if it does not arrive, click this link...
          </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-sm underline transition-colors text-blue-400 hover:text-blue-300"
            >
              Resend verification email
            </button>
        </div>
      </DraggableWindow>
    )
  }

  return (
    <DraggableWindow
      id="signup"
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialPosition={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (typeof window !== 'undefined' ? window.innerWidth / 2 - 250 : 250), y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 150 }}
      initialSize={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth : 500, height: typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerHeight : 500 }}
      zIndex={zIndex}
      onFocus={onFocus}
      colors={colors}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <div>
          <label htmlFor="email" className="block text-xs font-bold mb-2 uppercase tracking-wider text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 bg-transparent border-b-2 border-white/30 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            style={{
              fontSize: '11px',
            }}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-xs font-bold mb-2 uppercase tracking-wider text-white">
            Choose Country
          </label>
          <select
            id="country"
            {...register('country', { required: 'Country is required' })}
            className="w-full px-3 py-2 bg-transparent border-b-2 border-white/30 text-white focus:outline-none focus:border-white transition-colors"
            style={{
              fontSize: '11px',
              fontFamily: 'MS Sans Serif, sans-serif',
            }}
          >
            <option value="" className="bg-black text-white">Select...</option>
            {countries.map((country) => (
              <option key={country} value={country} className="bg-black text-white">
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-white text-black hover:bg-gray-100 transition-colors font-semibold text-sm uppercase tracking-wider"
        >
          Sign Up
        </button>

        <p className="text-xs text-center leading-relaxed mt-4 text-gray-400">
          Emails will be sent by or on behalf of Alba Rari. You may withdraw your consent at any time.
        </p>
      </form>
    </DraggableWindow>
  )
}

