import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Auth from './components/Auth.jsx'
import MovieCard from './components/MovieCard.jsx'
import AddMovieForm from './components/AddMovieForm.jsx'
import AIPanel from './components/AIPanel.jsx'

const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { background: 'transparent', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('watchlist')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('list')

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load movies from Supabase on mount
  useEffect(() => {
    if (session) loadMovies()
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMovies([])
  }

  const loadMovies = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id')
    if (error) {
      setError(error.message)
    } else {
      setMovies(data || [])
    }
    setLoading(false)
  }

  if (authLoading) return <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>
  if (!session) return <Auth />

  const updateMovie = async (id, updates) => {
    const { error } = await supabase
      .from('movies')
      .update(updates)
      .eq('id', id)
    if (!error) {
      setMovies(ms => ms.map(m => m.id === id ? { ...m, ...updates } : m))
    }
  }

  const deleteMovie = async (id) => {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
    if (!error) {
      setMovies(ms => ms.filter(m => m.id !== id))
    }
  }

  const addMovie = async (data) => {
    // Check for duplicates (case-insensitive title + year match)
    const duplicate = movies.find(m =>
      m.title.toLowerCase() === data.title.toLowerCase() &&
      (m.year === data.year || m.year === parseInt(data.year))
    )
    if (duplicate) {
      let msg = `"${data.title}" (${data.year}) is already in your list.`
      if (duplicate.status === 'watched' && duplicate.updated_at) {
        const watchedDate = new Date(duplicate.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        msg += ` Watched on ${watchedDate}.`
      }
      return { error: msg }
    }
    const { data: inserted, error } = await supabase
      .from('movies')
      .insert([data])
      .select()
      .single()
    if (!error && inserted) {
      setMovies(ms => [...ms, inserted])
    }
    return { error: error?.message || null }
  }

  const statusOrder = { watchlist: 0, skipped: 1, watched: 2 }
  const filtered = movies
    .filter(m => (filter === 'all' || m.status === filter) && (!search || m.title.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0))

  const watched = movies.filter(m => m.status === 'watched')
  const avgRating = watched.filter(m => m.rating).reduce((a, m) => a + m.rating, 0) / (watched.filter(m => m.rating).length || 1)

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: '#e8e8f0', paddingBottom: 40 }}>
      <style>{`
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #5b21b6 !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #2e2e4e; border-radius: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: '#0d0d1a', borderBottom: '1px solid #1e1e2e', padding: '18px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: 0, color: '#e8e8f0' }}>Reel Tracker</h1>
            <span style={{ color: '#5b21b6', fontSize: 20 }}>◈</span>
            <button onClick={handleSignOut} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Sign Out</button>
            {loading && <span style={{ color: '#7c3aed', fontSize: 12, marginLeft: 8 }}>Loading…</span>}
            {error && <span style={{ color: '#f87171', fontSize: 12, marginLeft: 8 }}>⚠ {error}</span>}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[
              { label: 'Total', value: movies.length },
              { label: 'Watched', value: watched.length },
              { label: 'Watchlist', value: movies.filter(m => m.status === 'watchlist').length },
              { label: 'Avg Rating', value: watched.filter(m => m.rating).length ? `${avgRating.toFixed(1)}★` : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: '#c084fc', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{value}</div>
                <div style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', marginTop: 16, borderBottom: '1px solid #1e1e2e' }}>
          {[{ key: 'list', label: 'Movies' }, { key: 'ai', label: '✦ AI Advisor' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ background: 'none', border: 'none', borderBottom: tab === key ? '2px solid #7c3aed' : '2px solid transparent', color: tab === key ? '#c084fc' : '#555', padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          {tab === 'list' && <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...selectStyle, width: 'auto' }}>
                <option value="all">All</option>
                <option value="watchlist">Watchlist</option>
                <option value="watched">Watched</option>
                <option value="skipped">Skipped</option>
              </select>
              <button onClick={() => setShowAdd(!showAdd)} style={btnPrimary}>{showAdd ? 'Cancel' : '+ Add'}</button>
            </div>

            {showAdd && (
              <div style={{ marginBottom: 12 }}>
                <AddMovieForm onAdd={addMovie} onClose={() => setShowAdd(false)} />
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading your movies…</div>
            ) : filtered.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center', padding: 30 }}>No movies found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onUpdate={updateMovie} onDelete={deleteMovie} />
                ))}
              </div>
            )}
          </>}

          {tab === 'ai' && <AIPanel movies={movies} />}
        </div>
      </div>
    </div>
  )
}
