import { useState } from 'react'
import StarRating from './StarRating.jsx'

const labelStyle = { color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }
const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { background: 'transparent', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }
const PLATFORMS = ['Netflix', 'Hulu', 'Max', 'Disney+', 'Apple TV+', 'Rent/Other']

export default function AddMovieForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', year: new Date().getFullYear(), platform: 'Netflix', language: 'English', genre: '', rt_critics: '', rt_audience: '', runtime: '', status: 'watchlist', rating: null, notes: '', synopsis: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await onAdd({ ...form, rt_critics: form.rt_critics ? parseInt(form.rt_critics) : null, rt_audience: form.rt_audience ? parseInt(form.rt_audience) : null })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ background: '#13131f', border: '1px solid #2e2e4e', borderRadius: 10, padding: 16 }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#e8e8f0', margin: '0 0 14px', fontSize: 16 }}>Add Movie</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Movie title" />
          </div>
          <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Year</label>
            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Platform</label>
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={selectStyle}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select>
          </div>
          <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Language</label>
            <input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} style={inputStyle} placeholder="English" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Genre</label>
            <input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} style={inputStyle} placeholder="Mystery / Thriller" />
          </div>
          <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Runtime</label>
            <input value={form.runtime} onChange={e => setForm({ ...form, runtime: e.target.value })} style={inputStyle} placeholder="2h 10m" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>RT Critics %</label>
            <input type="number" value={form.rt_critics} onChange={e => setForm({ ...form, rt_critics: e.target.value })} style={inputStyle} placeholder="85" />
          </div>
          <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>RT Audience %</label>
            <input type="number" value={form.rt_audience} onChange={e => setForm({ ...form, rt_audience: e.target.value })} style={inputStyle} placeholder="82" />
          </div>
          <div style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>
              <option value="watchlist">Watchlist</option>
              <option value="watched">Watched</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>Your Rating</label>
          <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, height: 50, resize: 'vertical' }} placeholder="Any notes..." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Add Movie'}</button>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
