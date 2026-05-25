import { useState } from 'react'
import StarRating from './StarRating.jsx'

const labelStyle = { color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }
const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { background: 'transparent', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }
const PLATFORMS = ['Netflix', 'Hulu', 'Max', 'Disney+', 'Apple TV+', 'Amazon Prime Video', 'Rent/Other']
const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

export default function AddMovieForm({ onAdd, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState({ title: '', year: '', platform: '', language: '', genre: '', rt_critics: '', rt_audience: '', runtime: '', status: 'watchlist', rating: null, notes: '', synopsis: '' })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [addError, setAddError] = useState(null)

  const searchMovies = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      // Search both OMDB and TMDB in parallel
      const [omdbRes, tmdbRes] = await Promise.allSettled([
        fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&type=movie&apikey=${OMDB_KEY}`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        }).then(r => r.json())
      ])

      const results = []
      const query = searchQuery.toLowerCase()

      // Add OMDB results
      if (omdbRes.status === 'fulfilled' && omdbRes.value.Search) {
        omdbRes.value.Search.slice(0, 5).forEach(m => {
          results.push({ id: m.imdbID, title: m.Title, year: m.Year, poster: m.Poster !== 'N/A' ? m.Poster : null, source: 'omdb', imdbID: m.imdbID })
        })
      }

      // Add TMDB results (deduplicate by title+year)
      if (tmdbRes.status === 'fulfilled' && tmdbRes.value.results) {
        tmdbRes.value.results.slice(0, 5).forEach(m => {
          const year = m.release_date?.split('-')[0] || ''
          const isDupe = results.some(r => r.title.toLowerCase() === m.title.toLowerCase() && r.year === year)
          if (!isDupe) {
            results.push({ id: `tmdb-${m.id}`, title: m.title, year, poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : null, source: 'tmdb', tmdbID: m.id })
          }
        })
      }

      // Sort: exact title matches first, then partial matches
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === query ? 0 : 1
        const bExact = b.title.toLowerCase() === query ? 0 : 1
        if (aExact !== bExact) return aExact - bExact
        return 0
      })

      setSearchResults(results.slice(0, 12))
    } catch (err) {
      setSearchResults([])
    }
    setSearching(false)
  }

  const selectMovie = async (movie) => {
    try {
      if (movie.source === 'omdb') {
        const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&plot=full&apikey=${OMDB_KEY}`)
        const data = await res.json()
        if (data.Response === 'True') {
          const rtCritics = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value?.replace('%', '') || ''
          const runtime = data.Runtime !== 'N/A' ? data.Runtime.replace(' min', 'm').replace(/(\d+)m/, (_, m) => {
            const hrs = Math.floor(parseInt(m) / 60)
            const mins = parseInt(m) % 60
            return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
          }) : ''
          setForm({ title: data.Title || '', year: data.Year ? parseInt(data.Year) : '', platform: '', language: data.Language?.split(',')[0]?.trim() || '', genre: data.Genre || '', rt_critics: rtCritics, rt_audience: '', runtime, status: 'watchlist', rating: null, notes: '', synopsis: data.Plot !== 'N/A' ? data.Plot : '' })
        }
      } else {
        // TMDB detail fetch
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbID}?language=en-US`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        })
        const data = await res.json()
        const hrs = Math.floor((data.runtime || 0) / 60)
        const mins = (data.runtime || 0) % 60
        const runtime = data.runtime ? (hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`) : ''
        const genres = data.genres?.map(g => g.name).join(' / ') || ''
        const lang = data.spoken_languages?.[0]?.english_name || ''
        let synopsis = data.overview || ''
        let rtCritics = ''

        // If TMDB has no overview or we want RT scores, try OMDB as fallback
        if (!synopsis || true) {
          try {
            const omdbFallback = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(data.title)}&y=${data.release_date?.split('-')[0] || ''}&apikey=${OMDB_KEY}`).then(r => r.json())
            if (omdbFallback.Response === 'True') {
              if (!synopsis && omdbFallback.Plot && omdbFallback.Plot !== 'N/A') synopsis = omdbFallback.Plot
              const rt = omdbFallback.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value?.replace('%', '')
              if (rt) rtCritics = rt
            }
          } catch { /* ignore fallback failure */ }
        }

        setForm({ title: data.title || '', year: data.release_date?.split('-')[0] ? parseInt(data.release_date.split('-')[0]) : '', platform: '', language: lang, genre: genres, rt_critics: rtCritics, rt_audience: '', runtime, status: 'watchlist', rating: null, notes: '', synopsis })
      }
      setShowForm(true)
      setSearchResults([])
    } catch { /* silently fail */ }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setAddError(null)
    setSaving(true)
    const result = await onAdd({
      ...form,
      synopsis: (form.synopsis || '').trim(),
      year: form.year ? parseInt(form.year) : null,
      rt_critics: form.rt_critics ? parseInt(form.rt_critics) : null,
      rt_audience: form.rt_audience ? parseInt(form.rt_audience) : null
    })
    if (result?.error) {
      setAddError(result.error)
      setSaving(false)
    } else {
      setSaving(false)
      onClose()
    }
  }

  return (
    <div style={{ background: '#13131f', border: '1px solid #2e2e4e', borderRadius: 10, padding: 16 }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#e8e8f0', margin: '0 0 14px', fontSize: 16 }}>Add Movie</h3>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchMovies()}
          placeholder="Search by movie title..."
          style={{ ...inputStyle, flex: 1 }}
          autoFocus
        />
        <button onClick={searchMovies} disabled={searching} style={btnPrimary}>
          {searching ? '...' : 'Search'}
        </button>
        <button onClick={() => { setShowForm(true); setSearchResults([]) }} style={btnSecondary}>Manual</button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: 12, maxHeight: 240, overflowY: 'auto' }}>
          {searchResults.map(m => (
            <div key={m.id} onClick={() => selectMovie(m)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e1e2e'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {m.poster && <img src={m.poster} alt="" style={{ width: 32, height: 48, borderRadius: 4, objectFit: 'cover' }} />}
              <div>
                <div style={{ color: '#e8e8f0', fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                <div style={{ color: '#666', fontSize: 11 }}>{m.year}
                  <span style={{ marginLeft: 8, color: '#444', fontSize: 10 }}>{m.source === 'tmdb' ? 'TMDB' : 'OMDB'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form fields (shown after search selection or manual click) */}
      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {addError && (
            <div style={{ background: '#2a1a1a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '8px 12px', color: '#fca5a5', fontSize: 13 }}>{addError}</div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Movie title" />
            </div>
            <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Year</label>
              <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={inputStyle} placeholder="2024" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={labelStyle}>Platform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={selectStyle}>
                <option value="">Select...</option>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
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
            <label style={labelStyle}>Synopsis</label>
            <textarea value={form.synopsis} onChange={e => setForm({ ...form, synopsis: e.target.value })} style={{ ...inputStyle, height: 50, resize: 'vertical' }} placeholder="Plot summary..." />
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
      )}

      {!showForm && searchResults.length === 0 && !searching && (
        <p style={{ color: '#555', fontSize: 12, margin: 0 }}>Search for a movie or click "Manual" to enter details by hand.</p>
      )}
    </div>
  )
}
