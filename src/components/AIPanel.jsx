import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const inputStyle = { background: '#0d0d1a', border: '1px solid #2e2e4e', borderRadius: 6, color: '#e8e8f0', padding: '7px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const btnPrimary = { background: '#5b21b6', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { background: 'transparent', border: '1px solid #2e2e4e', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }

export default function AIPanel({ movies }) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [mode, setMode] = useState('recommend')

  const buildContext = () => {
    const watched = movies.filter(m => m.status === 'watched')
    const liked = watched.filter(m => m.rating >= 4)
    const watchlist = movies.filter(m => m.status === 'watchlist')
    let ctx = 'Movie tracker:\n\n'
    if (liked.length) ctx += `LOVED:\n${liked.map(m => `- ${m.title} (${m.year}) [${m.genre}]${m.notes ? ` "${m.notes}"` : ''}`).join('\n')}\n\n`
    const midrated = watched.filter(m => m.rating === 3)
    if (midrated.length) ctx += `LIKED:\n${midrated.map(m => `- ${m.title}`).join('\n')}\n\n`
    if (watchlist.length) ctx += `WATCHLIST:\n${watchlist.map(m => `- ${m.title} (${m.year}) on ${m.platform}`).join('\n')}\n\n`
    ctx += 'Services: Netflix, Hulu, Max, Disney+, Apple TV+, Amazon Prime Video. Likes: foreign films (subtitles), mystery, thriller, action, morally complex dramas. Will rent for exceptional films.'
    return ctx
  }

  const prompts = {
    recommend: 'Recommend 5 films they haven\'t seen: title, year, why, where to stream, RT score.',
    analyze: 'Analyze their taste profile concisely. Patterns, directors, styles.',
    tonight: 'Pick ONE film from their watchlist for tonight. Make a compelling case.',
  }

  const ask = async (promptText) => {
    setLoading(true); setResponse('')
    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: { prompt: promptText, context: buildContext() }
      })
      if (error) throw error
      setResponse(data?.text || 'No response.')
    } catch (err) {
      setResponse('Error connecting to AI. Make sure the Edge Function is deployed and the API key is set.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0d0d1a', border: '1px solid #2a1a4a', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span>✦</span>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#c084fc', margin: 0, fontSize: 16 }}>AI Movie Advisor</h3>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[{ key: 'recommend', label: 'Get Recommendations' }, { key: 'tonight', label: 'Watch Tonight' }, { key: 'analyze', label: 'Analyze My Taste' }].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); ask(prompts[key]) }} disabled={loading}
            style={{ ...btnSecondary, borderColor: mode === key ? '#7c3aed' : '#2e2e4e', color: mode === key ? '#c084fc' : '#888', fontSize: 12 }}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && customPrompt.trim() && ask(customPrompt)}
          placeholder="Ask anything about what to watch..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => customPrompt.trim() && ask(customPrompt)} disabled={loading || !customPrompt.trim()} style={btnPrimary}>Ask</button>
      </div>
      {loading && <div style={{ color: '#7c3aed', fontSize: 13, display: 'flex', gap: 8 }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> Thinking...</div>}
      {response && !loading && <div style={{ background: '#13131f', border: '1px solid #2a1a4a', borderRadius: 8, padding: 12, color: '#ccc', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>{response}</div>}
      {!response && !loading && <p style={{ color: '#444', fontSize: 12, margin: 0 }}>Click a button or ask a question.</p>}
    </div>
  )
}
