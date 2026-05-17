import { useState } from 'react'

export default function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(null)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          onClick={() => !readonly && onChange && onChange(star === value ? null : star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            fontSize: 18,
            color: (hover || value) >= star ? '#f5c518' : '#3a3a4a',
            userSelect: 'none',
            transition: 'color 0.1s',
          }}>★</span>
      ))}
    </div>
  )
}
