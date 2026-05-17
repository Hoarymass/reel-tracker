import { useState, useRef } from 'react'
import StarRating from './StarRating.jsx'

const labelStyle = { color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }
const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { background: 'transparent', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }
const PLATFORMS = ['Netflix', 'Hulu', 'Max', 'Disney+', 'Apple TV+', 'Rent/Other']

function StatusBadge({ status }) {
  const s = { watched: { bg: '#1a3a2a', color: '#4ade80', label: 'Watched' }, watchlist: { bg: '#1a2a3a', color: '#60a5fa', label: 'Watchlist' }, skipped: { bg: '#2a1a1a', color: '#f87171', label: 'Skipped' } }[status] || { bg: '#1a2a3a', color: '#60a5fa', label: 'Watchlist' }
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>{s.label}</span>
}

function RTScore({ score, label }) {
  if (score == null) return <span style={{ color: '#555', fontSize: 12 }}>N/A</span>
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171'
  return <span style={{ fontSize: 12, color, fontWeight: 700 }}>{label && <span style={{ color: '#666', fontWeight: 400 }}>{label} </span>}{score}%</span>
}

export default function MovieCard({ movie, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ ...movie })
  const [saving, setSaving] = useState(false)
  const [streamCheck, setStreamCheck] = useState(null)
  const hasChecked = useRef(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(movie.id, draft)
    setSaving(false)
    setEditing(false)
  }

  const checkStreaming = async () => {
    if (hasChecked.current) return
    hasChecked.current = true
    setStreamCheck('checking')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 100,
          messages: [{ role: 'user', content: `What US streaming service has "${movie.title}" (${movie.year}) with a subscription — Netflix, Hulu, Max, Disney+, Apple TV+? If none say Rent/Other. Reply ONLY with JSON: {"platform":"Netflix"}` }] }),
      })
      const data = await res.json()
      const result = JSON.parse(data.content?.find(b => b.type === 'text')?.text.replace(/```json|```/g, '').trim())
      const changed = result.platform && result.platform !== movie.platform
      setStreamCheck({ platform: result.platform, changed })
      if (changed) onUpdate(movie.id, { platform: result.platform })
    } catch {
      setStreamCheck({ error: true, justwatch: `https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}` })
    }
  }

  return (
    <div style={{ background: '#13131f', border: '1px solid #1e1e2e', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2e2e4e'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}>
      <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        onClick={() => !editing && setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#e8e8f0', fontWeight: 600 }}>{movie.title}</span>
            <span style={{ color: '#555', fontSize: 12 }}>{movie.year}</span>
            <StatusBadge status={movie.status} />
            {!['English', 'English / Korean'].includes(movie.language) &&
              <span style={{ background: '#2a1a3a', color: '#c084fc', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4 }}>{movie.language}</span>}
          </div>
          <div style={{ marginTop: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#666', fontSize: 12 }}>{movie.genre}</span>
            <span style={{ color: '#444' }}>·</span>
            <span style={{ color: '#666', fontSize: 12 }}>{movie.platform}</span>
            <span style={{ color: '#444' }}>·</span>
            <span style={{ color: '#666', fontSize: 12 }}>{movie.runtime}</span>
            {movie.status === 'watched' && movie.rating && (<><span style={{ color: '#444' }}>·</span><StarRating value={movie.rating} readonly /></>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <RTScore score={movie.rt_critics} label="RT" />
          <span style={{ color: '#444', fontSize: 14, marginLeft: 4 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #1e1e2e', padding: '14px 16px' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={labelStyle}>Status</label>
                  <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })} style={selectStyle}>
                    <option value="watchlist">Watchlist</option>
                    <option value="watched">Watched</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={labelStyle}>Platform</label>
                  <select value={draft.platform} onChange={e => setDraft({ ...draft, platform: e.target.value })} style={selectStyle}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Your Rating</label>
                <StarRating value={draft.rating} onChange={v => setDraft({ ...draft, rating: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="What did you think?" style={{ ...inputStyle, height: 60, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setDraft({ ...movie }) }} style={btnSecondary}>Cancel</button>
                <button onClick={() => onDelete(movie.id)} style={{ ...btnSecondary, marginLeft: 'auto', color: '#f87171', borderColor: '#3a1a1a' }}>Remove</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <RTScore score={movie.rt_critics} label="Critics" />
                <RTScore score={movie.rt_audience} label="Audience" />
                <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {!streamCheck && <button onClick={checkStreaming} style={{ ...btnSecondary, fontSize: 11, padding: '3px 10px', color: '#7c3aed', borderColor: '#2a1a4a' }}>Check streaming</button>}
                  {streamCheck === 'checking' && <span style={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> checking…</span>}
                  {streamCheck?.changed && <span style={{ color: '#4ade80' }}>✓ Now on {streamCheck.platform}</span>}
                  {streamCheck && !streamCheck.changed && !streamCheck.error && streamCheck !== 'checking' && <span style={{ color: '#555' }}>✓ confirmed</span>}
                  {streamCheck?.error && <a href={streamCheck.justwatch} target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: 11, textDecoration: 'none' }}>Check JustWatch →</a>}
                </span>
              </div>
              {movie.synopsis && <p style={{ color: '#bbb', fontSize: 13, margin: '0 0 10px', lineHeight: 1.65 }}>{movie.synopsis}</p>}
              {movie.notes && <p style={{ color: '#777', fontSize: 12, margin: '0 0 10px', fontStyle: 'italic' }}>"{movie.notes}"</p>}
              <button onClick={() => setEditing(true)} style={btnSecondary}>Edit</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
