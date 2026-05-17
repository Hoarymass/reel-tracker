import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '10px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '10px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600, width: '100%' }

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' or 'reset'
  const [message, setMessage] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a password reset link.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: 12, padding: 32, width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#e8e8f0', margin: '0 0 4px 0', textAlign: 'center' }}>Reel Tracker</h1>
        <p style={{ color: '#555', fontSize: 13, textAlign: 'center', margin: '0 0 24px 0' }}>
          {mode === 'login' ? 'Sign in to continue' : 'Reset your password'}
        </p>

        {error && <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '8px 12px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ background: '#0a1a0a', border: '1px solid #14532d', borderRadius: 6, padding: '8px 12px', color: '#86efac', fontSize: 13, marginBottom: 16 }}>{message}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleReset}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          </div>

          {mode === 'login' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {mode === 'login' ? (
            <button onClick={() => { setMode('reset'); setError(null); setMessage(null) }} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer' }}>
              Forgot password?
            </button>
          ) : (
            <button onClick={() => { setMode('login'); setError(null); setMessage(null) }} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer' }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
