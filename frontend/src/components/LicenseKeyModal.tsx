// LicenseKeyModal.tsx
// Gumroad license key verification + full report unlock

import { useState, useEffect } from 'react'

export interface FullReportData {
  fullAnalysis: string
  palaceReadings: {
    person1: string
    person2: string
    combined: string
  }
  timingWindows: {
    q2_2026: string
    q3_2026: string
    q4_2026: string
  }
  karmicProtocol: string[]
  elementAdvice: string
  licenseKey: string
}

interface LicenseKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: FullReportData | { licenseKey: string }) => void
  resultPayload?: {
    person1: { date: string; time: string; gender: string }
    person2: { date: string; time: string; gender: string }
    score: number
    elementPair: string
  }
  skipReportGeneration?: boolean
  productId?: string
}

type Step = 'input' | 'verifying' | 'generating' | 'error'

export function LicenseKeyModal({
  isOpen,
  onClose,
  onSuccess,
  resultPayload,
  skipReportGeneration = false,
  productId,
}: LicenseKeyModalProps) {
  const [step, setStep] = useState<Step>('input')
  const [licenseKey, setLicenseKey] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (step !== 'verifying' && step !== 'generating') return
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(interval)
  }, [step])

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('input')
        setLicenseKey('')
        setErrorMsg('')
      }, 300)
    }
  }, [isOpen])

  const handleVerify = async () => {
    const key = licenseKey.trim()
    if (!key) {
      setErrorMsg('Please enter your license key.')
      return
    }

    setStep('verifying')
    setErrorMsg('')

    try {
      // Production always uses relative URLs (Vercel serverless)
      const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || '')
      const controller1 = new AbortController()
      const timeoutId1 = setTimeout(() => controller1.abort(), 15000)

      const verifyRes = await fetch(`${apiBaseUrl}/api/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          ...(productId ? { product_id: productId } : {}),
        }),
        signal: controller1.signal,
      })

      clearTimeout(timeoutId1)

      if (!verifyRes.ok) {
        let errorDetail = `HTTP ${verifyRes.status}`
        try {
          const errorData = await verifyRes.json()
          errorDetail = errorData.error || errorDetail
        } catch { /* ignore */ }
        throw new Error(`License verification failed: ${errorDetail}`)
      }

      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        setStep('error')
        setErrorMsg(verifyData.error || 'Invalid license key. Please check and try again.')
        return
      }

      // BaZi scenario — skip AI generation, unlock directly
      if (skipReportGeneration) {
        onSuccess({ licenseKey: key })
        return
      }

      if (!resultPayload) {
        setStep('error')
        setErrorMsg('Missing result data. Please try again.')
        return
      }

      setStep('generating')

      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), 30000)

      const reportRes = await fetch('/api/generate-full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          person1: resultPayload.person1,
          person2: resultPayload.person2,
          score: resultPayload.score,
          element_pair: resultPayload.elementPair,
        }),
        signal: controller2.signal,
      })

      clearTimeout(timeoutId2)

      if (!reportRes.ok) {
        let errorDetail = `HTTP ${reportRes.status}`
        try {
          const errorData = await reportRes.json()
          errorDetail = errorData.error || errorDetail
        } catch { /* ignore */ }
        throw new Error(`Report generation failed: ${errorDetail}`)
      }

      const reportData = await reportRes.json()

      if (!reportData.success) {
        setStep('error')
        setErrorMsg('Report generation failed. Please try again or contact support.')
        return
      }

      onSuccess({ ...reportData.report, licenseKey: key })
    } catch (err: any) {
      setStep('error')
      let errorMessage = 'Network error. Please check your connection and try again.'
      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      setErrorMsg(errorMessage)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 'input') handleVerify()
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="license-modal-overlay"
      onClick={e => e.target === e.currentTarget && step === 'input' && onClose()}
    >
      <div className="license-modal-panel">

        {/* Close button — only in input/error states */}
        {(step === 'input' || step === 'error') && (
          <button className="license-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}

        {/* ── Input / Error state ── */}
        {(step === 'input' || step === 'error') && (
          <div onKeyDown={handleKeyDown}>
            <div style={{ marginBottom: '24px' }}>
              <div className="license-modal-badge">ALREADY PURCHASED</div>
              <h2 className="license-modal-title">Enter Your License Key</h2>
              <p className="license-modal-desc">
                Check your email from Gumroad — your key looks like{' '}
                <code className="license-modal-code">XXXX-XXXX-XXXX-XXXX</code>
              </p>
            </div>

            <input
              autoFocus
              className={`license-modal-input${errorMsg ? ' license-modal-input--error' : ''}`}
              value={licenseKey}
              onChange={e => {
                setLicenseKey(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder="Paste your license key here"
            />

            {errorMsg && (
              <p className="license-modal-error">⚠ {errorMsg}</p>
            )}

            <button
              className="license-modal-verify-btn"
              onClick={handleVerify}
              disabled={!licenseKey.trim()}
            >
              Unlock My Full Blueprint →
            </button>

            <p className="license-modal-hint">
              Lost your key?{' '}
              <a
                href="https://app.gumroad.com/library"
                target="_blank"
                rel="noopener noreferrer"
              >
                Find it in your Gumroad library →
              </a>
            </p>
          </div>
        )}

        {/* ── Verifying state ── */}
        {step === 'verifying' && (
          <div className="license-modal-state">
            <div className="license-modal-state-icon">🔮</div>
            <h3 className="license-modal-state-title">Verifying your access{dots}</h3>
            <p className="license-modal-state-sub">Confirming your purchase with Gumroad</p>
            <div className="license-modal-spinner license-modal-spinner--verify" />
          </div>
        )}

        {/* ── Generating state ── */}
        {step === 'generating' && (
          <div className="license-modal-state">
            <div className="license-modal-state-icon">✨</div>
            <h3 className="license-modal-state-title">Reading your elemental bond{dots}</h3>
            <p className="license-modal-state-sub">Analyzing palace configurations</p>
            <p className="license-modal-state-note">This takes about 15–20 seconds</p>
            <div className="license-modal-spinner" />
          </div>
        )}

      </div>
    </div>
  )
}
