// EmailGateModal.tsx
// Email gate component - appears after teaser to collect email and unlock preview

import { useState, useEffect } from 'react'

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
      // Call backend API to store email with timeout
      const apiBaseUrl = import.meta.env.VITE_API_URL || ''
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时

      const response = await fetch(`${apiBaseUrl}/api/capture-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          source: 'email_gate',
          ...(score !== undefined ? { score } : {}),
          ...(elementPair !== undefined ? { element_pair: elementPair } : {}),
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 检查HTTP状态码
      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorDetail = errorData.error || errorDetail
        } catch {
          // 忽略JSON解析错误
        }
        throw new Error(`Server error: ${errorDetail}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      // Success: notify parent component
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

  return (
    <div
      className="email-gate-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 10, 22, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '520px',
          margin: '0 20px',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          animation: 'slideUp 0.3s ease',
          border: '1px solid rgba(210, 187, 255, 0.2)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#d2bbff',
            lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          ×
        </button>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 12px rgba(210, 187, 255, 0.3))',
            }}
          >
            🔮
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#c4a7ff',
              marginBottom: '12px',
            }}
          >
            UNLOCK YOUR PREVIEW
          </div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#f7f2ff',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Want to see more?
          </h2>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          {score !== undefined && elementPair ? (
            <p
              style={{
                color: '#d2bbff',
                fontSize: '16px',
                lineHeight: 1.6,
                margin: '0 0 20px',
              }}
            >
              Your <strong style={{ color: '#f7f2ff' }}>{elementPair}</strong> bond scored{' '}
              <strong style={{ color: '#f7f2ff' }}>{score}/100</strong>.
            </p>
          ) : null}
          <p
            style={{
              color: '#b8a3e0',
              fontSize: '15px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {score !== undefined && elementPair
              ? 'Enter your email to unlock the complete compatibility preview + your 2026 timing insights.'
              : 'Enter your email to unlock your Day Master, Five Element balance, and personality profile.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            placeholder="your@email.com"
            disabled={submitting}
            autoFocus
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '16px',
              border: error ? '2px solid #ff6b9d' : '2px solid rgba(210, 187, 255, 0.3)',
              borderRadius: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f7f2ff',
              transition: 'all 0.2s',
              marginBottom: '12px',
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = 'rgba(210, 187, 255, 0.6)'
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = 'rgba(210, 187, 255, 0.3)'
            }}
          />

          {error && (
            <p
              style={{
                color: '#ff6b9d',
                fontSize: '14px',
                marginTop: '-8px',
                marginBottom: '12px',
              }}
            >
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !email.trim()}
            style={{
              width: '100%',
              padding: '18px',
              background:
                submitting || !email.trim()
                  ? 'rgba(196, 167, 255, 0.3)'
                  : 'linear-gradient(135deg, #8b7a9f, #c4a7ff)',
              color: submitting || !email.trim() ? '#888' : '#1a1a2e',
              border: 'none',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: 700,
              cursor: submitting || !email.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
              boxShadow:
                submitting || !email.trim()
                  ? 'none'
                  : '0 8px 24px rgba(196, 167, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!submitting && email.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(196, 167, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                submitting || !email.trim() ? 'none' : '0 8px 24px rgba(196, 167, 255, 0.3)'
            }}
          >
            {submitting ? 'Unlocking...' : 'Unlock My Preview →'}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#9a8ab8',
              marginTop: '16px',
              marginBottom: 0,
            }}
          >
            🔒 No spam. Instant access. Unsubscribe anytime.
          </p>
        </form>

        {/* Social proof */}
        <div
          style={{
            marginTop: '28px',
            padding: '16px',
            background: 'rgba(196, 167, 255, 0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(196, 167, 255, 0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#c4a7ff',
              fontSize: '14px',
            }}
          >
            <span style={{ fontSize: '16px' }}>✨</span>
            <span>
              <strong>2,847</strong> souls unlocked their preview this month
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
