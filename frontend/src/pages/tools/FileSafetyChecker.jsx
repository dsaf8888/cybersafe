import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import './tools.css'

/* ---------------------------------------------------------------
   Extension risk database
   --------------------------------------------------------------- */
const EXT_DB = {
  /* HIGH risk — executable / macro / script */
  exe:  { risk: 'high', cat: 'Executable',    note: 'Windows executable — can install anything. Only run if you trust the source 100%.' },
  msi:  { risk: 'high', cat: 'Executable',    note: 'Windows installer — runs with elevated rights.' },
  bat:  { risk: 'high', cat: 'Script',         note: 'Batch script — runs commands instantly when opened.' },
  cmd:  { risk: 'high', cat: 'Script',         note: 'Windows command script — same risk as .bat.' },
  ps1:  { risk: 'high', cat: 'Script',         note: 'PowerShell script — full system access.' },
  vbs:  { risk: 'high', cat: 'Script',         note: 'VBScript — heavily abused by malware.' },
  js:   { risk: 'high', cat: 'Script',         note: 'JavaScript file — Windows Script Host can run it outside a browser.' },
  scr:  { risk: 'high', cat: 'Executable',    note: 'Screensaver — actually a renamed .exe.' },
  jar:  { risk: 'high', cat: 'Executable',    note: 'Java archive — runs Java code with system rights.' },
  app:  { risk: 'high', cat: 'Executable',    note: 'macOS application bundle.' },
  dmg:  { risk: 'med',  cat: 'Installer',      note: 'macOS disk image — may contain unsigned apps.' },
  pkg:  { risk: 'high', cat: 'Installer',      note: 'macOS installer — runs with admin rights.' },
  deb:  { risk: 'med',  cat: 'Installer',      note: 'Debian/Ubuntu package — installs as root.' },
  rpm:  { risk: 'med',  cat: 'Installer',      note: 'Red Hat package — installs as root.' },
  apk:  { risk: 'med',  cat: 'Installer',      note: 'Android app — only install from trusted sources.' },

  /* Macro-enabled documents */
  docm: { risk: 'high', cat: 'Document',       note: 'Word document with macros — top phishing vector.' },
  xlsm: { risk: 'high', cat: 'Document',       note: 'Excel with macros — common malware delivery.' },
  pptm: { risk: 'high', cat: 'Document',       note: 'PowerPoint with macros.' },

  /* MEDIUM — could contain hidden payloads */
  pdf:  { risk: 'med',  cat: 'Document',       note: 'PDFs can execute JavaScript. Open in a sandboxed viewer.' },
  doc:  { risk: 'med',  cat: 'Document',       note: 'Legacy Word format — can include macros.' },
  xls:  { risk: 'med',  cat: 'Document',       note: 'Legacy Excel format — can include macros.' },
  ppt:  { risk: 'med',  cat: 'Document',       note: 'Legacy PowerPoint format — can include macros.' },
  zip:  { risk: 'med',  cat: 'Archive',        note: 'Archive — verify contents before extracting.' },
  rar:  { risk: 'med',  cat: 'Archive',        note: 'Archive — verify contents before extracting.' },
  '7z': { risk: 'med',  cat: 'Archive',        note: 'Archive — verify contents before extracting.' },
  iso:  { risk: 'high', cat: 'Disk Image',     note: 'Mounts as a drive on Windows — increasingly abused for malware.' },
  img:  { risk: 'med',  cat: 'Disk Image',     note: 'Disk image — verify before mounting.' },
  lnk:  { risk: 'high', cat: 'Shortcut',       note: 'Windows shortcut — can launch any program with hidden flags.' },
  html: { risk: 'med',  cat: 'Web',            note: 'HTML file — can include JS that opens external resources.' },
  htm:  { risk: 'med',  cat: 'Web',            note: 'HTML file — can include JS that opens external resources.' },

  /* LOW — generally safe content types */
  txt:  { risk: 'low',  cat: 'Plain text',     note: 'Plain text — safe to open.' },
  csv:  { risk: 'low',  cat: 'Spreadsheet',    note: 'Comma-separated values — text-only.' },
  jpg:  { risk: 'low',  cat: 'Image',          note: 'JPEG image — low risk.' },
  jpeg: { risk: 'low',  cat: 'Image',          note: 'JPEG image — low risk.' },
  png:  { risk: 'low',  cat: 'Image',          note: 'PNG image — low risk.' },
  gif:  { risk: 'low',  cat: 'Image',          note: 'GIF — low risk.' },
  webp: { risk: 'low',  cat: 'Image',          note: 'WebP image — low risk.' },
  svg:  { risk: 'med',  cat: 'Image',          note: 'SVG can include JavaScript — be cautious if opened in browser.' },
  mp4:  { risk: 'low',  cat: 'Video',          note: 'Video file — low risk.' },
  mov:  { risk: 'low',  cat: 'Video',          note: 'Video file — low risk.' },
  mp3:  { risk: 'low',  cat: 'Audio',          note: 'Audio file — low risk.' },
  wav:  { risk: 'low',  cat: 'Audio',          note: 'Audio file — low risk.' },
  docx: { risk: 'low',  cat: 'Document',       note: 'Modern Word format — macro-free by default.' },
  xlsx: { risk: 'low',  cat: 'Document',       note: 'Modern Excel format — macro-free by default.' },
  pptx: { risk: 'low',  cat: 'Document',       note: 'Modern PowerPoint format — macro-free by default.' },
}

const RISK_META = {
  high: { label: 'High risk',   color: '#ef4444', bg: '#fef2f2', score: 0 },
  med:  { label: 'Medium risk', color: '#f59e0b', bg: '#fffbeb', score: 50 },
  low:  { label: 'Low risk',    color: '#22c55e', bg: '#f0fdf4', score: 95 },
}

/* ---------------------------------------------------------------
   Helpers
   --------------------------------------------------------------- */
function getExtension(name) {
  const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

function getAllExtensions(name) {
  /* For double-extension detection: "invoice.pdf.exe" -> ["pdf", "exe"] */
  return String(name).toLowerCase().split('.').slice(1)
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
}

async function sha256(file) {
  if (!crypto.subtle) return null
  const buf = await file.arrayBuffer()
  const hashBuf = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* ---------------------------------------------------------------
   Risk analysis — returns flags + overall verdict
   --------------------------------------------------------------- */
function analyseFile(file) {
  const ext = getExtension(file.name)
  const exts = getAllExtensions(file.name)
  const extInfo = EXT_DB[ext] || { risk: 'med', cat: 'Unknown', note: 'Unknown extension — treat with caution.' }

  const flags = []

  /* extension risk */
  flags.push({
    id: 'ext-risk',
    severity: extInfo.risk,
    title: `Extension: .${ext || '(none)'}`,
    detail: extInfo.note,
    badge: extInfo.cat,
  })

  /* double extension */
  if (exts.length >= 2) {
    const inner = exts[exts.length - 2]
    if (EXT_DB[inner] && EXT_DB[inner].risk === 'low') {
      flags.push({
        id: 'double-ext',
        severity: 'high',
        title: 'Double extension',
        detail: `Filename ends in ".${inner}.${ext}" — a classic trick to disguise an executable as a document.`,
        badge: 'Filename trick',
      })
    }
  }

  /* suspicious filename keywords */
  const keywords = ['invoice', 'payment', 'receipt', 'urgent', 'shipment', 'tracking', 'password', 'order', 'refund', 'tax']
  const lower = file.name.toLowerCase()
  const matched = keywords.filter((k) => lower.includes(k))
  if (matched.length > 0 && extInfo.risk !== 'low') {
    flags.push({
      id: 'social-eng',
      severity: 'med',
      title: 'Social-engineering filename',
      detail: `Filename includes "${matched.join(', ')}" — common phishing lure patterns.`,
      badge: 'Pretext',
    })
  }

  /* unusual chars */
  if (/[\u202E\u200E\u200F\u200B]/.test(file.name)) {
    flags.push({
      id: 'unicode-trick',
      severity: 'high',
      title: 'Invisible / RTL Unicode characters',
      detail: 'Filename contains hidden direction-override characters used to disguise the real extension.',
      badge: 'Unicode trick',
    })
  }

  /* very large or zero-byte */
  if (file.size === 0) {
    flags.push({
      id: 'empty',
      severity: 'low',
      title: 'Empty file (0 bytes)',
      detail: 'The file has no content — could be a placeholder or a download glitch.',
      badge: 'Anomaly',
    })
  } else if (file.size > 250 * 1024 * 1024) {
    flags.push({
      id: 'large',
      severity: 'low',
      title: 'Very large file',
      detail: 'Files over 250 MB may contain bundled installers — be sure of the source.',
      badge: 'Anomaly',
    })
  }

  /* MIME mismatch (best-effort) */
  if (file.type && extInfo.cat) {
    const expected = mimeFamily(file.type)
    const actual = extInfo.cat.toLowerCase()
    if (expected && !actual.includes(expected) && expected !== 'unknown') {
      flags.push({
        id: 'mime-mismatch',
        severity: 'med',
        title: 'MIME type mismatch',
        detail: `Browser reports MIME "${file.type}" but extension suggests ${extInfo.cat.toLowerCase()}. May be disguised.`,
        badge: 'Mismatch',
      })
    }
  }

  /* Compute risk score */
  const sev = { high: 35, med: 15, low: 3 }
  let pts = 100 - flags.reduce((s, f) => s + (sev[f.severity] || 0), 0)
  pts = Math.max(0, Math.min(100, pts))

  return { flags, score: pts, extInfo, ext, exts }
}

function mimeFamily(mime) {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('text/'))  return 'plain text'
  if (mime.includes('pdf'))      return 'document'
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('archive')) return 'archive'
  return 'unknown'
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function FileSafetyChecker() {
  const [file, setFile]       = useState(null)
  const [hash, setHash]       = useState(null)
  const [hashing, setHashing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError]     = useState('')

  const analysis = useMemo(() => (file ? analyseFile(file) : null), [file])

  async function ingest(f) {
    setError('')
    setHash(null)
    if (!f) return
    if (f.size > 500 * 1024 * 1024) {
      setError('Files over 500 MB are too large for in-browser analysis.')
      return
    }
    setFile(f)
    setHashing(true)
    try {
      const h = await sha256(f)
      setHash(h)
    } catch {
      setHash('hash-unavailable')
    } finally {
      setHashing(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) ingest(f)
  }

  function reset() {
    setFile(null)
    setHash(null)
    setError('')
  }

  const verdict = analysis ? (
    analysis.score < 50 ? { kind: 'danger',  icon: '🚨', label: 'Do not open this file', desc: 'Multiple high-risk indicators. If you didn\'t expect this file, delete it.' }
  : analysis.score < 85 ? { kind: 'caution', icon: '⚠️', label: 'Open with caution',     desc: 'Some risk indicators present. Scan with antivirus and verify the source first.' }
                        : { kind: 'safe',    icon: '✅', label: 'Likely safe',            desc: 'No major red flags. Still verify the source if downloaded from email or messaging.' }
  ) : null

  return (
    <PageLayout>
      {/* ===== HERO ===== */}
      <header className="tool-hero">
        <div className="tool-hero-bg" aria-hidden>
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="grid-bg" />
        </div>
        <div className="tool-hero-inner tool-hero-inner-single">
          <div className="tool-hero-text">
            <span className="tool-hero-tag">📁 File Safety Checker · Free Tool</span>
            <h1>Is that file <span className="accent">safe to open?</span></h1>
            <p>
              Drop a file below to scan its extension, name patterns, MIME type and SHA-256 hash.
              We never upload the file — all analysis happens in your browser.
            </p>

            {!file && (
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
              >
                <input
                  type="file"
                  id="file-input"
                  className="drop-zone-input"
                  onChange={(e) => ingest(e.target.files?.[0])}
                />
                <label htmlFor="file-input" className="drop-zone-label">
                  <div className="drop-zone-emoji" aria-hidden>{dragOver ? '🎯' : '📥'}</div>
                  <strong>{dragOver ? 'Drop to scan' : 'Drop a file here'}</strong>
                  <span>or click to browse · up to 500 MB</span>
                </label>
              </div>
            )}

            {file && (
              <div className="file-card">
                <div className="file-card-icon" aria-hidden>
                  {analysis.extInfo.cat === 'Image' ? '🖼' :
                   analysis.extInfo.cat === 'Video' ? '🎬' :
                   analysis.extInfo.cat === 'Audio' ? '🎵' :
                   analysis.extInfo.cat === 'Archive' ? '🗜' :
                   analysis.extInfo.cat === 'Executable' ? '⚠️' :
                   analysis.extInfo.cat === 'Document' ? '📄' : '📁'}
                </div>
                <div className="file-card-meta">
                  <strong>{file.name}</strong>
                  <span>{formatBytes(file.size)} · {file.type || 'unknown MIME'} · .{analysis.ext || 'no extension'}</span>
                </div>
                <button type="button" className="file-card-reset" onClick={reset} title="Clear">✕</button>
              </div>
            )}

            {error && <div className="target-error">{error}</div>}

            <div className="tool-hero-trust">
              <span>🔒 Files never leave your browser</span>
              <span>·</span>
              <span>Real SHA-256</span>
              <span>·</span>
              <span>Free</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="tool-body">
        {!file && (
          <>
            <div className="tool-section-head">
              <h2>What we check</h2>
              <p>Six fast heuristics that catch the majority of malware-disguised files.</p>
            </div>
            <div className="pw-tips-grid">
              <div className="pw-tip-card"><div className="pw-tip-icon">🧨</div><h4>Extension risk</h4><p>.exe, .msi, .bat, .vbs, .docm and friends all carry execution risk.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🎭</div><h4>Double extensions</h4><p>"invoice.pdf.exe" disguises an executable as a document.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🪤</div><h4>Pretext keywords</h4><p>"Invoice", "payment", "shipping" combined with risky extensions = phishing.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🧬</div><h4>Unicode tricks</h4><p>Right-to-left override characters hide the real file type.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🔍</div><h4>MIME mismatch</h4><p>When the file&apos;s MIME type doesn&apos;t match its extension, something is off.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🔐</div><h4>SHA-256 hash</h4><p>Computed locally — paste it into VirusTotal for a multi-engine scan.</p></div>
            </div>
          </>
        )}

        {file && analysis && verdict && (
          <>
            <section className={`verdict-banner verdict-${verdict.kind}`}>
              <div className="verdict-icon" aria-hidden>{verdict.icon}</div>
              <div className="verdict-body">
                <div className="verdict-eyebrow">FILE VERDICT</div>
                <h2>{verdict.label}</h2>
                <p>{verdict.desc}</p>
              </div>
              <div className="verdict-stats">
                <div className="verdict-stat"><strong>{analysis.score}</strong><span>/100 safety score</span></div>
                <div className="verdict-stat"><strong>{analysis.flags.length}</strong><span>indicators</span></div>
              </div>
            </section>

            {/* Hash card */}
            <section className="file-hash-card">
              <div className="file-hash-head">
                <span className="file-hash-icon" aria-hidden>🔐</span>
                <div>
                  <h3>SHA-256 Hash</h3>
                  <p>Computed locally. Paste into VirusTotal or HybridAnalysis for a multi-engine scan.</p>
                </div>
              </div>
              <div className="file-hash-value">
                {hashing && <span style={{ color: 'var(--muted)' }}>Computing hash…</span>}
                {!hashing && hash && <code>{hash}</code>}
                {!hashing && !hash && <span style={{ color: 'var(--muted)' }}>Unavailable</span>}
              </div>
              {!hashing && hash && (
                <div className="file-hash-actions">
                  <button type="button" className="file-hash-btn" onClick={() => navigator.clipboard?.writeText(hash)}>
                    📋 Copy hash
                  </button>
                  <a
                    href={`https://www.virustotal.com/gui/file/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-hash-btn primary"
                  >
                    🔎 Look up on VirusTotal →
                  </a>
                </div>
              )}
            </section>

            {/* Indicators */}
            <div className="tool-section-head" style={{ marginTop: 40 }}>
              <h2>Risk indicators</h2>
              <p>Each indicator either confirms safety or raises a flag.</p>
            </div>
            <div className="file-indicator-list">
              {analysis.flags.map((f) => {
                const meta = RISK_META[f.severity]
                return (
                  <div key={f.id} className="file-indicator" style={{ borderLeft: `4px solid ${meta.color}` }}>
                    <div className="file-indicator-head">
                      <h4>{f.title}</h4>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="file-indicator-cat">{f.badge}</span>
                        <span className="file-indicator-sev" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <p>{f.detail}</p>
                  </div>
                )
              })}
            </div>

            <div className="pw-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
              <button type="button" className="btn-run" onClick={reset}>
                <span className="btn-run-icon">↻</span>
                Scan another file
              </button>
            </div>
          </>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Where did the file come from?</h3>
            <p>If it was emailed or DM&apos;d, scan the URL or sender first with our other tools.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/scam-analyzer" className="btn-submit">Scam analyzer →</Link>
            <Link to="/tools/url-scanner" className="btn-secondary">URL scanner</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
