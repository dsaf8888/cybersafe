export function CyberSafeLogo({ size = 28, accent = '#1a6dff', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <path d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z" fill={accent} opacity=".15" />
      <path d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z" stroke={accent} strokeWidth="2" fill="none" />
      <path d="M9 14l3 3 7-7" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
