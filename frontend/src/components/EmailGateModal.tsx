// EmailGateModal.tsx
// Email gate component - appears after teaser to collect email and unlock preview

import { useState, useEffect } from 'react'
import { getPreviewUnlockCount } from '../utils/counters'

interface EmailGateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (email: string) => void
  score?: number
  elementPair?: string
}

export function EmailGateModal({
  isOpen,
  onClose,
  onSuccess,
  score,
  elementPair,
}: EmailGateModalProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [previewCount] = useState(() => getPreviewUnlockCount())

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail('')
        setError('')
        setSubmitting(false)
      }, 300)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Production always uses relative URLs (Vercel serverless)
      const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || '')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`${apiBaseUrl}/api/capture-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          source: 'email_gate',
          ...(score !== undefined ? { score } : {}),
          ...(elementPair !== undefined ? { element_pair: elementPair } : {}),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorDetail = errorData.error || errorDetail
        } catch { /* ignore */ }
        throw new Error(`Server error: ${errorDetail}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      onSuccess(trimmedEmail)
    } catch (err: any) {
      let errorMessage = 'Network error. Please check your connection.'
      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  const isReady = !submitting && !!email.trim()

  return (
    <div
      className="email-gate-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="email-gate-panel">
        {/* Close button */}
        <button className="email-gate-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {/* Icon + header */}
        <div className="email-gate-header">
          <div className="email-gate-icon">🔮</div>
          <div className="email-gate-badge">UNLOCK YOUR PREVIEW</div>
          <h2 className="email-gate-title">Want to see more?</h2>
        </div>

        {/* Description */}
        <div className="email-gate-desc">
          {score !== undefined && elementPair ? (
            <p className="email-gate-score-line">
              Your <strong>{elementPair}</strong> bond scored{' '}
              <strong>{score}/100</strong>.
            </p>
          ) : null}
          <p className="email-gate-hint">
            {score !== undefined && elementPair
              ? 'Enter your email to unlock the complete compatibility preview + your 2026 timing insights.'
              : 'Enter your email to unlock your Day Master, Five Element balance, and personality profile.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <input
            type="email"
            className={`email-gate-input${error ? ' email-gate-input--error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            placeholder="your@email.com"
            disabled={submitting}
            autoFocus
          />

          {error && <p className="email-gate-error">⚠ {error}</p>}

          <button
            type="submit"
            className="email-gate-submit"
            disabled={!isReady}
          >
            {submitting ? 'Unlocking...' : 'Unlock My Preview →'}
          </button>

          <p className="email-gate-note">
            🔒 No spam. Instant access. Unsubscribe anytime.
          </p>
        </form>

        {/* Social proof */}
        <div className="email-gate-social">
          <span>✨</span>
          <span><strong>{previewCount.toLocaleString()}</strong> souls unlocked their preview this month</span>
        </div>
      </div>
    </div>
  )
}
