export function WaveDivider({ color = '#FAF7F2', flip = false, className = '' }) {
  return (
    <div
      className={`wave-divider ${flip ? 'rotate-180' : ''} ${className}`}
      style={{ backgroundColor: 'transparent' }}
    >
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,20 L1440,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

export function WaveDividerTop({ color = '#0A0A0F', className = '' }) {
  return (
    <div className={`wave-divider ${className}`}>
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,0 L0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,10 L1440,0 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
