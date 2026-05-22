/* =====================================================================
   Browser-side website audit.

   No API keys, no rate limits, no backend. The target URL is fetched
   via a public CORS proxy (with automatic fallback across providers)
   and the HTML + response headers are inspected client-side to compute
   four Lighthouse-style category scores:

     • performance    — page weight, render-blocking resources, TTFB
     • accessibility  — alt text, labels, landmarks, lang, headings
     • best-practices — HTTPS + security headers, doctype, charset
     • seo            — title, description, viewport, OG, lang, hreflang

   Caveats vs. real Lighthouse (PSI):
     - We cannot measure Core Web Vitals (LCP, CLS, FCP, TBT) because
       those require actually rendering the page in a real Chrome.
     - Some checks are heuristic (e.g. estimated page weight is based
       on summing referenced resource sizes from response headers).
   ===================================================================== */

/* Public CORS proxies in priority order — each is free, no key needed.
   We try them in sequence on failure. */
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

const FETCH_TIMEOUT_MS = 20_000

export async function runBrowserAudit(url, { onProgress } = {}) {
  const stage = (label) => onProgress?.(label)

  stage('Fetching HTML through CORS proxy…')
  const { response, html, ttfbMs, totalMs, proxyUsed } = await fetchWithFallback(url)

  stage('Parsing document…')
  const doc = new DOMParser().parseFromString(html, 'text/html')

  stage('Analysing resources & page weight…')
  const resources = collectResources(doc, url)
  const weightSummary = await measurePageWeight(resources, html)

  stage('Scoring audits…')
  const audits = [
    ...performanceAudits(doc, html, ttfbMs, weightSummary, resources, url, response),
    ...accessibilityAudits(doc),
    ...bestPracticesAudits(doc, response, url),
    ...seoAudits(doc, url),
  ]

  const categories = ['performance', 'accessibility', 'best-practices', 'seo'].map((id) => {
    const items = audits.filter((a) => a.category === id)
    const applicable = items.filter((a) => a.pass != null)
    const weightSum  = applicable.reduce((s, a) => s + a.weight, 0)
    const passSum    = applicable.filter((a) => a.pass).reduce((s, a) => s + a.weight, 0)
    const score      = weightSum === 0 ? null : passSum / weightSum
    return { id, score, audits: items }
  })

  return {
    url,
    finalDisplayUrl: response.url || url,
    ranAt: Date.now(),
    proxyUsed,
    timings: { ttfbMs, totalMs },
    weightSummary,
    categories,
    auditsById: Object.fromEntries(audits.map((a) => [a.id, a])),
  }
}

/* --------------------------------------------------------------------- */
/*  Fetch with proxy fallback                                            */
/* --------------------------------------------------------------------- */

async function fetchWithFallback(url) {
  const errors = []
  for (const make of PROXIES) {
    const proxyUrl = make(url)
    try {
      const ctrl = new AbortController()
      const timeoutId = setTimeout(() => ctrl.abort('timeout'), FETCH_TIMEOUT_MS)
      const start = performance.now()
      const response = await fetch(proxyUrl, { signal: ctrl.signal })
      const ttfbMs = Math.round(performance.now() - start)
      if (!response.ok) {
        clearTimeout(timeoutId)
        errors.push(`${labelOf(proxyUrl)}: HTTP ${response.status}`)
        continue
      }
      const html = await response.text()
      const totalMs = Math.round(performance.now() - start)
      clearTimeout(timeoutId)
      if (!html || html.length < 50) {
        errors.push(`${labelOf(proxyUrl)}: empty response`)
        continue
      }
      return { response, html, ttfbMs, totalMs, proxyUsed: labelOf(proxyUrl) }
    } catch (err) {
      errors.push(`${labelOf(proxyUrl)}: ${err.message || err}`)
    }
  }
  throw new Error(
    `Couldn't fetch the site through any of our CORS proxies. The site may be blocking proxies or temporarily down.\n\n${errors.join('\n')}`
  )
}

function labelOf(proxyUrl) {
  try { return new URL(proxyUrl).hostname } catch { return proxyUrl }
}

/* --------------------------------------------------------------------- */
/*  Resource discovery + page weight                                     */
/* --------------------------------------------------------------------- */

function absoluteUrl(href, base) {
  try { return new URL(href, base).toString() } catch { return null }
}

function collectResources(doc, baseUrl) {
  const css = [...doc.querySelectorAll('link[rel="stylesheet"][href]')]
    .map((el) => ({
      type: 'css',
      url: absoluteUrl(el.getAttribute('href'), baseUrl),
      blocking: !el.hasAttribute('media') || el.getAttribute('media') === 'all'
              || el.getAttribute('media') === 'screen',
    }))
    .filter((r) => r.url)

  const js = [...doc.querySelectorAll('script[src]')]
    .map((el) => ({
      type: 'js',
      url: absoluteUrl(el.getAttribute('src'), baseUrl),
      blocking: !el.hasAttribute('async') && !el.hasAttribute('defer')
              && !(el.getAttribute('type') === 'module'),
      inHead: isInHead(el),
    }))
    .filter((r) => r.url)

  const img = [...doc.querySelectorAll('img[src]')]
    .map((el) => ({
      type: 'img',
      url: absoluteUrl(el.getAttribute('src'), baseUrl),
      hasAlt: el.hasAttribute('alt'),
      lazy: el.getAttribute('loading') === 'lazy',
      hasDim: el.hasAttribute('width') && el.hasAttribute('height'),
    }))
    .filter((r) => r.url)

  const fonts = [...doc.querySelectorAll('link[rel="preload"][as="font"], link[rel="stylesheet"][href*="fonts."]')]
    .map((el) => ({ type: 'font', url: absoluteUrl(el.getAttribute('href'), baseUrl) }))
    .filter((r) => r.url)

  const iframes = doc.querySelectorAll('iframe').length

  return { css, js, img, fonts, iframes }
}

function isInHead(el) {
  let parent = el.parentElement
  while (parent) {
    if (parent.tagName === 'HEAD') return true
    if (parent.tagName === 'BODY') return false
    parent = parent.parentElement
  }
  return false
}

async function measurePageWeight(resources, html) {
  /* We don't fetch every resource (too slow + may hit proxy limits).
     Instead we estimate by sampling the first few CSS + JS resources
     for their Content-Length via HEAD-equivalent through the proxy. */
  const htmlBytes = new Blob([html]).size

  const sampleTargets = [
    ...resources.css.slice(0, 4),
    ...resources.js.slice(0, 6),
  ]

  const samples = await Promise.all(sampleTargets.map(probeSize))
  const successful = samples.filter((s) => s.bytes != null)

  /* Extrapolate: avg size of probed × total count of each kind */
  const avgCss = avgByType(successful, 'css')
  const avgJs  = avgByType(successful, 'js')

  const estCss = avgCss * resources.css.length
  const estJs  = avgJs  * resources.js.length

  return {
    htmlBytes,
    cssCount: resources.css.length,
    jsCount: resources.js.length,
    imgCount: resources.img.length,
    fontCount: resources.fonts.length,
    iframeCount: resources.iframes,
    estCssBytes: Math.round(estCss),
    estJsBytes: Math.round(estJs),
    estTotalBytes: Math.round(htmlBytes + estCss + estJs),
    sampledCount: successful.length,
  }
}

function avgByType(samples, type) {
  const list = samples.filter((s) => s.type === type && s.bytes != null)
  if (list.length === 0) return 0
  return list.reduce((s, x) => s + x.bytes, 0) / list.length
}

async function probeSize({ type, url }) {
  /* Try fetching the resource via the first proxy.
     We only read the headers/length, but most CORS proxies don't
     support HEAD requests, so we fall back to GET and abort early. */
  const proxyUrl = PROXIES[0](url)
  try {
    const ctrl = new AbortController()
    const timeoutId = setTimeout(() => ctrl.abort('timeout'), 6000)
    const resp = await fetch(proxyUrl, { signal: ctrl.signal })
    const cl = resp.headers.get('content-length')
    if (cl) {
      ctrl.abort()
      clearTimeout(timeoutId)
      return { type, url, bytes: parseInt(cl, 10) }
    }
    const blob = await resp.blob()
    clearTimeout(timeoutId)
    return { type, url, bytes: blob.size }
  } catch {
    return { type, url, bytes: null }
  }
}

/* --------------------------------------------------------------------- */
/*  Audits                                                               */
/* --------------------------------------------------------------------- */

function audit(opts) {
  return {
    pass: null,
    weight: 1,
    ...opts,
  }
}

/* ----- Performance ----- */
function performanceAudits(doc, html, ttfbMs, weight, resources) {
  const a = []

  a.push(audit({
    id: 'perf-ttfb',
    category: 'performance',
    title: 'Server responds quickly',
    weight: 3,
    pass: ttfbMs < 800,
    value: `${ttfbMs}ms via proxy`,
    description: 'How long until the first byte arrived. Under 800ms is good. Measured via our CORS proxy so it includes proxy overhead.',
  }))

  a.push(audit({
    id: 'perf-html-size',
    category: 'performance',
    title: 'HTML document is reasonably sized',
    weight: 2,
    pass: weight.htmlBytes < 100_000,
    value: `${(weight.htmlBytes / 1024).toFixed(1)} KB`,
    description: 'Initial HTML responses under 100 KB load fast on slow connections. Bigger documents indicate too much inline content.',
  }))

  a.push(audit({
    id: 'perf-total-weight',
    category: 'performance',
    title: 'Total estimated page weight is reasonable',
    weight: 3,
    pass: weight.estTotalBytes < 2_500_000,
    value: `≈ ${(weight.estTotalBytes / 1024 / 1024).toFixed(2)} MB`,
    description: `Estimated by summing HTML + sampled CSS/JS. Pages over 2.5 MB feel slow on mobile. (Sampled ${weight.sampledCount} resources of ${weight.cssCount + weight.jsCount}.)`,
  }))

  const blockingJs = resources.js.filter((r) => r.blocking && r.inHead).length
  a.push(audit({
    id: 'perf-render-blocking-js',
    category: 'performance',
    title: 'No render-blocking scripts in <head>',
    weight: 3,
    pass: blockingJs === 0,
    value: blockingJs === 0 ? 'None' : `${blockingJs} script${blockingJs > 1 ? 's' : ''}`,
    description: 'Synchronous scripts in <head> block the page from rendering until they download and execute. Add async/defer/type=module to non-critical scripts.',
  }))

  const stylesheets = resources.css.length
  a.push(audit({
    id: 'perf-stylesheet-count',
    category: 'performance',
    title: 'Stylesheet count is low',
    weight: 1,
    pass: stylesheets <= 4,
    value: `${stylesheets}`,
    description: 'Each external stylesheet is a render-blocking request. Bundle them when possible.',
  }))

  a.push(audit({
    id: 'perf-js-count',
    category: 'performance',
    title: 'Script count is low',
    weight: 1,
    pass: resources.js.length <= 10,
    value: `${resources.js.length}`,
    description: 'Lots of small script tags mean lots of round-trips. Bundle and code-split intentionally.',
  }))

  const imagesWithoutLazy = resources.img.filter((r) => !r.lazy).length
  const imagesWithoutDim  = resources.img.filter((r) => !r.hasDim).length
  if (resources.img.length > 0) {
    a.push(audit({
      id: 'perf-img-lazy',
      category: 'performance',
      title: 'Images use lazy loading',
      weight: 1,
      pass: imagesWithoutLazy / resources.img.length < 0.5,
      value: `${resources.img.length - imagesWithoutLazy} / ${resources.img.length} use loading="lazy"`,
      description: 'loading="lazy" on offscreen <img> defers downloads until they\'re scrolled into view, saving bandwidth and battery.',
    }))
    a.push(audit({
      id: 'perf-img-dim',
      category: 'performance',
      title: 'Images declare width & height',
      weight: 1,
      pass: imagesWithoutDim / resources.img.length < 0.25,
      value: `${resources.img.length - imagesWithoutDim} / ${resources.img.length}`,
      description: 'Explicit width and height on <img> let the browser reserve space, eliminating layout shift (better CLS).',
    }))
  }

  const inlineScriptBytes = [...doc.querySelectorAll('script:not([src])')]
    .reduce((s, el) => s + (el.textContent?.length || 0), 0)
  if (inlineScriptBytes > 0) {
    a.push(audit({
      id: 'perf-inline-js',
      category: 'performance',
      title: 'Inline script payload is small',
      weight: 1,
      pass: inlineScriptBytes < 50_000,
      value: `${(inlineScriptBytes / 1024).toFixed(1)} KB inline`,
      description: 'Large inline scripts can\'t be cached separately and bloat the initial HTML.',
    }))
  }

  return a
}

/* ----- Accessibility ----- */
function accessibilityAudits(doc) {
  const a = []

  /* lang attribute on <html> */
  const lang = doc.documentElement.getAttribute('lang')
  a.push(audit({
    id: 'a11y-html-lang',
    category: 'accessibility',
    title: '<html> has a lang attribute',
    weight: 2,
    pass: !!(lang && lang.trim()),
    value: lang || '(missing)',
    description: 'Screen readers use the lang attribute to pick the correct pronunciation. Set lang="en", "fr", etc.',
  }))

  /* Document title */
  const title = doc.title.trim()
  a.push(audit({
    id: 'a11y-doc-title',
    category: 'accessibility',
    title: 'Document has a <title>',
    weight: 2,
    pass: title.length > 0,
    value: title || '(missing)',
    description: 'The <title> is the first thing announced by screen readers and shown in tabs and search results.',
  }))

  /* Images with alt text */
  const imgs = [...doc.querySelectorAll('img')]
  const missingAlt = imgs.filter((el) => !el.hasAttribute('alt')).length
  if (imgs.length > 0) {
    a.push(audit({
      id: 'a11y-img-alt',
      category: 'accessibility',
      title: 'All images have an alt attribute',
      weight: 3,
      pass: missingAlt === 0,
      value: missingAlt === 0
        ? `${imgs.length}/${imgs.length} OK`
        : `${imgs.length - missingAlt}/${imgs.length} OK — ${missingAlt} missing alt`,
      description: 'Every <img> needs an alt attribute (use alt="" for decorative images) so screen readers can describe or skip them.',
    }))
  }

  /* Form inputs have labels */
  const inputs = [...doc.querySelectorAll('input, select, textarea')]
    .filter((el) => el.getAttribute('type') !== 'hidden')
  if (inputs.length > 0) {
    const unlabelled = inputs.filter((el) => {
      if (el.hasAttribute('aria-label')) return false
      if (el.hasAttribute('aria-labelledby')) return false
      if (el.hasAttribute('title')) return false
      const id = el.getAttribute('id')
      if (id && doc.querySelector(`label[for="${cssEscape(id)}"]`)) return false
      if (el.closest('label')) return false
      return true
    }).length

    a.push(audit({
      id: 'a11y-form-labels',
      category: 'accessibility',
      title: 'Form inputs have labels',
      weight: 2,
      pass: unlabelled === 0,
      value: unlabelled === 0
        ? `${inputs.length}/${inputs.length} OK`
        : `${inputs.length - unlabelled}/${inputs.length} OK — ${unlabelled} unlabelled`,
      description: 'Every input needs a programmatic label: a wrapping <label>, label[for], aria-label, or aria-labelledby.',
    }))
  }

  /* Buttons / links have accessible text */
  const linksAndButtons = [...doc.querySelectorAll('a[href], button')]
  const emptyAccessible = linksAndButtons.filter((el) => {
    if (el.hasAttribute('aria-label')) return false
    if (el.hasAttribute('aria-labelledby')) return false
    if (el.hasAttribute('title')) return false
    const text = (el.textContent || '').trim()
    if (text.length > 0) return false
    /* Image-only links/buttons OK if image has alt */
    const img = el.querySelector('img[alt]')
    if (img && img.getAttribute('alt')?.trim().length > 0) return false
    return true
  }).length
  if (linksAndButtons.length > 0) {
    a.push(audit({
      id: 'a11y-empty-buttons',
      category: 'accessibility',
      title: 'All buttons and links have accessible text',
      weight: 2,
      pass: emptyAccessible === 0,
      value: emptyAccessible === 0
        ? `${linksAndButtons.length}/${linksAndButtons.length} OK`
        : `${emptyAccessible} empty`,
      description: 'Icon-only buttons and links need aria-label or aria-labelledby so screen reader users know what they do.',
    }))
  }

  /* Heading hierarchy — exactly one h1, no skipped levels */
  const headings = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')]
  const h1s = headings.filter((h) => h.tagName === 'H1').length
  a.push(audit({
    id: 'a11y-h1',
    category: 'accessibility',
    title: 'Page has exactly one <h1>',
    weight: 1,
    pass: h1s === 1,
    value: `${h1s} <h1> tag${h1s === 1 ? '' : 's'}`,
    description: 'A single, clear <h1> is the spoken title of the page for AT users.',
  }))

  /* <main> landmark */
  const hasMain = !!doc.querySelector('main, [role="main"]')
  a.push(audit({
    id: 'a11y-landmark-main',
    category: 'accessibility',
    title: 'Has a <main> landmark',
    weight: 1,
    pass: hasMain,
    value: hasMain ? 'Present' : '(missing)',
    description: 'A <main> element (or role="main") lets screen reader users jump straight to the primary content.',
  }))

  /* Viewport meta */
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || ''
  a.push(audit({
    id: 'a11y-viewport-zoom',
    category: 'accessibility',
    title: 'Viewport allows zoom',
    weight: 1,
    pass: !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?/i.test(viewport),
    value: viewport || '(missing)',
    description: 'Don\'t set user-scalable=no or maximum-scale=1 — users with low vision need to pinch-zoom.',
  }))

  return a
}

/* Lightweight CSS.escape polyfill for older browsers */
function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s)
  return String(s).replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&')
}

/* ----- Best Practices ----- */
function bestPracticesAudits(doc, response, url) {
  const a = []
  const isHttps = url.startsWith('https://')
  const headers = response.headers

  a.push(audit({
    id: 'bp-https',
    category: 'best-practices',
    title: 'Site is served over HTTPS',
    weight: 3,
    pass: isHttps,
    value: isHttps ? 'Yes' : 'No',
    description: 'HTTPS is mandatory in modern browsers — many features (Service Workers, Geolocation, etc.) only work over HTTPS.',
  }))

  if (isHttps) {
    const hsts = headers.get('strict-transport-security')
    a.push(audit({
      id: 'bp-hsts',
      category: 'best-practices',
      title: 'HSTS header set',
      weight: 2,
      pass: !!hsts,
      value: hsts || '(missing)',
      description: 'Strict-Transport-Security tells browsers to always use HTTPS for your domain, preventing protocol downgrade attacks.',
    }))
  }

  const csp = headers.get('content-security-policy')
  a.push(audit({
    id: 'bp-csp',
    category: 'best-practices',
    title: 'Content Security Policy is configured',
    weight: 2,
    pass: !!csp,
    value: csp ? 'Present' : '(missing)',
    description: 'CSP defends against XSS by whitelisting which sources can load scripts, styles, and other resources.',
  }))

  const xfo = headers.get('x-frame-options') || (csp && /frame-ancestors/i.test(csp) ? 'via CSP frame-ancestors' : null)
  a.push(audit({
    id: 'bp-xfo',
    category: 'best-practices',
    title: 'Clickjacking protection in place',
    weight: 1,
    pass: !!xfo,
    value: xfo || '(missing)',
    description: 'X-Frame-Options or CSP frame-ancestors prevents your site from being embedded in malicious iframes.',
  }))

  const xcto = headers.get('x-content-type-options')
  a.push(audit({
    id: 'bp-xcto',
    category: 'best-practices',
    title: 'X-Content-Type-Options: nosniff',
    weight: 1,
    pass: /nosniff/i.test(xcto || ''),
    value: xcto || '(missing)',
    description: 'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
  }))

  const referrer = headers.get('referrer-policy')
  a.push(audit({
    id: 'bp-referrer',
    category: 'best-practices',
    title: 'Referrer-Policy is set',
    weight: 1,
    pass: !!referrer,
    value: referrer || '(missing)',
    description: 'Controls how much referrer information is sent with outgoing requests. strict-origin-when-cross-origin is a sensible default.',
  }))

  /* Doctype */
  const doctype = doc.doctype?.name
  a.push(audit({
    id: 'bp-doctype',
    category: 'best-practices',
    title: 'Page uses the HTML5 doctype',
    weight: 1,
    pass: doctype === 'html',
    value: doctype || '(missing)',
    description: 'The HTML5 doctype <!DOCTYPE html> triggers standards mode and avoids quirks-mode rendering bugs.',
  }))

  /* Charset declared */
  const charset = doc.querySelector('meta[charset]')?.getAttribute('charset')
                || (doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content') || '').match(/charset=([\w-]+)/i)?.[1]
  a.push(audit({
    id: 'bp-charset',
    category: 'best-practices',
    title: 'Character encoding is declared',
    weight: 1,
    pass: !!(charset && /utf-?8/i.test(charset)),
    value: charset || '(missing)',
    description: 'Declare <meta charset="utf-8"> early in <head> to avoid mojibake and parsing weirdness.',
  }))

  /* Mixed content — only meaningful on HTTPS */
  if (isHttps) {
    const mixed = [...doc.querySelectorAll('script[src], link[href], img[src], iframe[src]')]
      .map((el) => el.getAttribute('src') || el.getAttribute('href') || '')
      .filter((u) => /^http:\/\//i.test(u)).length
    a.push(audit({
      id: 'bp-mixed-content',
      category: 'best-practices',
      title: 'No mixed (HTTP) content',
      weight: 2,
      pass: mixed === 0,
      value: mixed === 0 ? 'None' : `${mixed} insecure resource${mixed > 1 ? 's' : ''}`,
      description: 'Insecure HTTP resources on an HTTPS page are blocked by browsers. Replace http:// with https:// or // (protocol-relative).',
    }))
  }

  return a
}

/* ----- SEO ----- */
function seoAudits(doc, url) {
  const a = []

  /* Title */
  const title = doc.title.trim()
  a.push(audit({
    id: 'seo-title',
    category: 'seo',
    title: 'Page has a descriptive <title>',
    weight: 3,
    pass: title.length >= 10 && title.length <= 70,
    value: title ? `"${title.slice(0, 60)}${title.length > 60 ? '…' : ''}" (${title.length} chars)` : '(missing)',
    description: 'Aim for 30–60 chars. Too short = uninformative; too long = truncated in search results.',
  }))

  /* Meta description */
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || ''
  a.push(audit({
    id: 'seo-description',
    category: 'seo',
    title: 'Page has a meta description',
    weight: 2,
    pass: desc.length >= 50 && desc.length <= 170,
    value: desc ? `${desc.length} chars` : '(missing)',
    description: 'Meta description (70–160 chars) appears as the snippet in search results. Write it like an ad.',
  }))

  /* Viewport */
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || ''
  a.push(audit({
    id: 'seo-viewport',
    category: 'seo',
    title: 'Page has a mobile viewport',
    weight: 2,
    pass: /width\s*=\s*device-width/i.test(viewport),
    value: viewport || '(missing)',
    description: 'Without <meta name="viewport" content="width=device-width">, mobile browsers render the page at desktop width.',
  }))

  /* h1 */
  const h1Count = doc.querySelectorAll('h1').length
  a.push(audit({
    id: 'seo-h1',
    category: 'seo',
    title: 'Page has an <h1>',
    weight: 1,
    pass: h1Count >= 1,
    value: `${h1Count}`,
    description: 'Search engines use the <h1> as a strong signal of the page topic.',
  }))

  /* Canonical link */
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')
  a.push(audit({
    id: 'seo-canonical',
    category: 'seo',
    title: 'Canonical link declared',
    weight: 1,
    pass: !!canonical,
    value: canonical || '(missing)',
    description: 'Tells search engines the preferred URL for this page, avoiding duplicate-content penalties.',
  }))

  /* Open Graph */
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
  const ogDesc  = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  const ogPresent = !!(ogTitle && ogDesc && ogImage)
  a.push(audit({
    id: 'seo-og',
    category: 'seo',
    title: 'Open Graph tags for social sharing',
    weight: 1,
    pass: ogPresent,
    value: ogPresent ? 'Complete (title + description + image)' : `Missing: ${[
      !ogTitle && 'og:title', !ogDesc && 'og:description', !ogImage && 'og:image',
    ].filter(Boolean).join(', ')}`,
    description: 'Open Graph tags control how your page looks when shared on Facebook, LinkedIn, iMessage, etc.',
  }))

  /* Lang */
  const lang = doc.documentElement.getAttribute('lang')
  a.push(audit({
    id: 'seo-lang',
    category: 'seo',
    title: '<html lang> attribute set',
    weight: 1,
    pass: !!(lang && lang.trim()),
    value: lang || '(missing)',
    description: 'Search engines and translation tools use the lang attribute to handle the page correctly.',
  }))

  /* Robots not blocking */
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || ''
  const blocked = /noindex/i.test(robots)
  a.push(audit({
    id: 'seo-robots',
    category: 'seo',
    title: 'Page is indexable',
    weight: 2,
    pass: !blocked,
    value: blocked ? `Blocked: ${robots}` : (robots || 'No directive (indexable)'),
    description: 'A noindex meta tag tells search engines to drop the page from their index. Make sure this is intentional.',
  }))

  /* HTTPS for SEO */
  a.push(audit({
    id: 'seo-https',
    category: 'seo',
    title: 'Served over HTTPS',
    weight: 1,
    pass: url.startsWith('https://'),
    value: url.startsWith('https://') ? 'Yes' : 'No',
    description: 'HTTPS has been a confirmed lightweight ranking signal since 2014.',
  }))

  /* Structured data */
  const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]').length
  a.push(audit({
    id: 'seo-structured-data',
    category: 'seo',
    title: 'Has structured data (JSON-LD)',
    weight: 1,
    pass: jsonLd > 0,
    value: jsonLd > 0 ? `${jsonLd} JSON-LD block${jsonLd > 1 ? 's' : ''}` : '(none)',
    description: 'Schema.org JSON-LD enables rich snippets in search results (FAQs, reviews, products, etc.).',
  }))

  return a
}
