// LicenseKeyModal.tsx
// File path: frontend/src/components/LicenseKeyModal.tsx
// Purpose: Gumroad payment license key verification + full report unlock

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
  // 把当前的结果数据传入，用于生成完整报告
  resultPayload?: {
    person1: { date: string; time: string; gender: string }
    person2: { date: string; time: string; gender: string }
    score: number
    elementPair: string // e.g. "Water-Wood"
  }
  // 跳过 report generation（BaZi 场景：数据已在前端）
  skipReportGeneration?: boolean
  // 指定产品 ID（BaZi 场景用 "swpdpb"）
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

  // 动态省略号动画
  useEffect(() => {
    if (step !== 'verifying' && step !== 'generating') return
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(interval)
  }, [step])

  // 关闭时重置状态
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
      // Step 1: 验证 Gumroad license key with timeout
      const apiBaseUrl = import.meta.env.VITE_API_URL || ''
      const controller1 = new AbortController()
      const timeoutId1 = setTimeout(() => controller1.abort(), 15000) // 15秒超时

      const verifyRes = await fetch(`${apiBaseUrl}/api/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          ...(productId ? { product_id: productId } : {}),
        }),
        signal: controller1.signal
      })

      clearTimeout(timeoutId1)

      if (!verifyRes.ok) {
        let errorDetail = `HTTP ${verifyRes.status}`
        try {
          const errorData = await verifyRes.json()
          errorDetail = errorData.error || errorDetail
        } catch {
          // 忽略JSON解析错误
        }
        throw new Error(`License verification failed: ${errorDetail}`)
      }

      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        setStep('error')
        setErrorMsg(verifyData.error || 'Invalid license key. Please check and try again.')
        return
      }

      // 如果是 BaZi 场景（skipReportGeneration），跳过 AI 报告生成，直接解锁
      if (skipReportGeneration) {
        onSuccess({ licenseKey: key })
        return
      }

      // Step 2: 生成完整报告 with timeout
      if (!resultPayload) {
        setStep('error')
        setErrorMsg('Missing result data. Please try again.')
        return
      }

      setStep('generating')
      
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), 30000) // 报告生成可能需要更长时间，30秒

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
        signal: controller2.signal
      })

      clearTimeout(timeoutId2)

      if (!reportRes.ok) {
        let errorDetail = `HTTP ${reportRes.status}`
        try {
          const errorData = await reportRes.json()
          errorDetail = errorData.error || errorDetail
        } catch {
          // 忽略JSON解析错误
        }
        throw new Error(`Report generation failed: ${errorDetail}`)
      }

      const reportData = await reportRes.json()

      if (!reportData.success) {
        setStep('error')
        setErrorMsg('Report generation failed. Please try again or contact support.')
        return
      }

      // 成功：把完整报告数据传回父组件
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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 20, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #12152A, #1A1E38)',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '460px',
          margin: '0 16px',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139, 111, 232, 0.15)',
          animation: 'slideUp 0.25s ease',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* 关闭按钮 */}
        {step === 'input' || step === 'error' ? (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#999',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        ) : null}

        {/* === 输入阶段 === */}
        {(step === 'input' || step === 'error') && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#F0B34B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
                ALREADY PURCHASED
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#EDEDF0', margin: 0, lineHeight: 1.3 }}>
                Enter Your License Key
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(237,237,240,0.6)', marginTop: '10px', lineHeight: 1.6 }}>
                Check your email from Gumroad — your key looks like{' '}
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#EDEDF0' }}>
                  XXXX-XXXX-XXXX-XXXX
                </code>
              </p>
            </div>

            <div onKeyDown={handleKeyDown}>
              <input
                autoFocus
                value={licenseKey}
                onChange={e => {
                  setLicenseKey(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder="Paste your license key here"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: errorMsg ? '1.5px solid #FF6B6B' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#EDEDF0',
                  transition: 'border-color 0.2s',
                }}
              />

              {errorMsg && (
                <p style={{ color: '#e55', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                  ⚠ {errorMsg}
                </p>
              )}

              <button
                onClick={handleVerify}
                disabled={!licenseKey.trim()}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '16px',
                  background: licenseKey.trim() ? 'linear-gradient(135deg, #F0B34B, #D4942E)' : 'rgba(255,255,255,0.08)',
                  color: licenseKey.trim() ? '#0A0E1A' : '#666',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: licenseKey.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  letterSpacing: '0.02em',
                }}
              >
                Unlock My Full Blueprint →
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(237,237,240,0.4)', marginTop: '12px' }}>
                Lost your key?{' '}
                <a
                  href="https://app.gumroad.com/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#F0B34B', textDecoration: 'none' }}
                >
                  Find it in your Gumroad library →
                </a>
              </p>
            </div>
          </>
        )}

        {/* === 验证中 === */}
        {step === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔮</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>
              Verifying your access{dots}
            </h3>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
              Confirming your purchase with Gumroad
            </p>
            <LoadingSpinner />
          </div>
        )}

        {/* === 生成报告中 === */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>✨</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>
              Reading your elemental bond{dots}
            </h3>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 4px' }}>
              Analyzing palace configurations
            </p>
            <p style={{ color: '#bbb', fontSize: '13px', margin: 0 }}>
              This takes about 15–20 seconds
            </p>
            <LoadingSpinner color="#c4956a" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

function LoadingSpinner({ color = '#888' }: { color?: string }) {
  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        border: `3px solid #f0ece8`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '20px auto 0',
      }}
    />
  )
}
