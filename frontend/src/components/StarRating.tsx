function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  const filled = Math.round(value)
  return (
    <span className="star-display" aria-label={`${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star-icon${i < filled ? ' star-icon--filled' : ''}`}>
          ★
        </span>
      ))}
    </span>
  )
}

function StarInput({
  value,
  onChange,
  max = 5,
}: {
  value: number
  onChange: (v: number) => void
  max?: number
}) {
  return (
    <span className="star-input">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`star-icon star-icon--clickable${i < value ? ' star-icon--filled' : ''}`}
          onClick={() => onChange(i + 1)}
          role="button"
          aria-label={`Rate ${i + 1} out of ${max}`}
        >
          ★
        </span>
      ))}
      <span className="star-label">{value} / {max}</span>
    </span>
  )
}

export { StarDisplay, StarInput }
