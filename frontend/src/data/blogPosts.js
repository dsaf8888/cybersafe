/**
 * Blog post catalogue. Used by /blog (listing) and /blog/:slug (post view).
 * Categories: 'everyone' | 'dev' | 'biz'
 * Body content uses a tiny block schema so we can render rich layouts without a markdown lib.
 *   { type: 'p',  text }
 *   { type: 'h2', text }
 *   { type: 'h3', text }
 *   { type: 'ul', items: [...] }
 *   { type: 'ol', items: [...] }
 *   { type: 'callout', kind?: 'info' | 'warn' | 'success', title?, text }
 *   { type: 'code', language, text }
 *   { type: 'quote', text, by? }
 */

export const CATEGORY_META = {
  everyone: {
    id: 'everyone',
    label: 'For Everyone',
    short: 'Everyone',
    icon: '🛡️',
    color: 'blue',
    desc: 'Practical security guides for everyday internet users.',
  },
  dev: {
    id: 'dev',
    label: 'For Developers',
    short: 'Developer',
    icon: '👨‍💻',
    color: 'purple',
    desc: 'Deep technical content on secure code, APIs, and infrastructure.',
  },
  biz: {
    id: 'biz',
    label: 'For Businesses',
    short: 'Business',
    icon: '🏢',
    color: 'cyan',
    desc: 'Compliance, incident response, and team-level security.',
  },
}

export const BLOG_POSTS = [
  /* ────────── EVERYONE ────────── */
  {
    slug: 'is-your-email-already-leaked',
    category: 'everyone',
    title: 'Is Your Email Already Leaked?',
    excerpt:
      'Learn how to check if your email has been exposed in known data breaches and the exact steps to take next to secure your accounts.',
    cover: { emoji: '💻', class: 'p1' },
    date: 'May 15, 2026',
    readTime: '5 min read',
    author: { name: 'Priya Mehta', initials: 'PM', role: 'Co-founder & CTO' },
    tags: ['email', 'breach', 'beginner'],
    body: [
      { type: 'p', text: 'Every week, somewhere between 5 and 30 million email addresses get added to publicly known breach databases. The bad news: yours might already be there. The good news: it takes literally 30 seconds to check, and another 5 minutes to lock things down.' },
      { type: 'h2', text: 'What "leaked" actually means' },
      { type: 'p', text: 'When a website you use is hacked, attackers usually grab the full user table: emails, hashed passwords, sometimes names, phone numbers, or even security questions. That data ends up on hacker forums and eventually in aggregators like Have I Been Pwned.' },
      { type: 'p', text: 'A leak does not mean your current password is exposed (the hash usually has to be cracked first), but it does mean two things: attackers know you have an account on that service, and they will try the credentials they crack against every major site.' },
      { type: 'h2', text: 'Check in 30 seconds' },
      { type: 'ol', items: [
        'Open the CyberSafe Email Breach Checker.',
        'Enter the email you want to check.',
        'Read the list of breaches it appears in, and when each happened.',
      ] },
      { type: 'callout', kind: 'success', title: 'Privacy first', text: 'Your email is hashed before it is sent. We never log the plaintext address or your search history.' },
      { type: 'h2', text: 'If your email shows up in a breach' },
      { type: 'h3', text: '1. Change the password on that exact site first' },
      { type: 'p', text: 'And anywhere else you reused it. Yes, even that throwaway forum from 2014 — attackers love credential stuffing.' },
      { type: 'h3', text: '2. Turn on two-factor authentication everywhere' },
      { type: 'p', text: 'Prefer a TOTP app (Google Authenticator, Authy, Aegis) over SMS. SIM-swapping is real.' },
      { type: 'h3', text: '3. Watch for follow-up phishing' },
      { type: 'p', text: 'Breached emails get targeted with hyper-personalized phishing within weeks. Be extra skeptical of "your account has been flagged"-style messages.' },
      { type: 'callout', kind: 'warn', title: 'Common trap', text: 'A breach notification email is itself a common phishing pretext. Never click links — go to the service directly in your browser.' },
      { type: 'h2', text: 'Stop the next leak from hurting you' },
      { type: 'p', text: 'You cannot prevent companies from getting hacked, but you can make sure one breach does not topple your other accounts: unique passwords, a password manager, and 2FA. That trio is the modern minimum.' },
    ],
  },
  {
    slug: 'top-5-password-mistakes',
    category: 'everyone',
    title: 'Top 5 Password Mistakes People Make',
    excerpt:
      'From reuse to short passphrases to predictable patterns — and the five-minute fixes that turn weak passwords into strong ones.',
    cover: { emoji: '🔒', class: 'p2' },
    date: 'May 10, 2026',
    readTime: '4 min read',
    author: { name: 'Aarav Sharma', initials: 'AS', role: 'Co-founder & CEO' },
    tags: ['passwords', 'beginner'],
    body: [
      { type: 'p', text: 'Most people are not careless — they just learned password "rules" twenty years ago and never updated their mental model. Here are the five mistakes we see most often, and how to fix each in under five minutes.' },
      { type: 'h2', text: '1. Reusing the same password across sites' },
      { type: 'p', text: 'When site A gets breached, attackers immediately try the same email/password on Gmail, Amazon, your bank. This is called credential stuffing and it is responsible for an estimated 80% of account takeovers.' },
      { type: 'callout', text: 'Fix: install a password manager (Bitwarden is free), import your passwords once, and let it generate unique ones going forward.' },
      { type: 'h2', text: '2. Choosing short, "tricky" passwords' },
      { type: 'p', text: '"P@ssw0rd!" feels clever but is in every cracker\'s rule set. Modern GPUs guess 100 billion such patterns per second.' },
      { type: 'p', text: 'A 16-character passphrase like "blue-moose-rides-cycling" takes centuries.' },
      { type: 'h2', text: '3. Using personal info' },
      { type: 'p', text: 'Birthdays, pet names, your kid\'s name — all of this is on your social media. Attackers script through the obvious combinations first.' },
      { type: 'h2', text: '4. Storing passwords in browser without a master password' },
      { type: 'p', text: 'Browser-saved passwords are great, but if your laptop gets stolen and you have no OS login or no master password, the thief gets everything. Set a Chrome/Firefox sync passphrase.' },
      { type: 'h2', text: '5. Never changing critical passwords' },
      { type: 'p', text: 'You do not need to rotate every 90 days — that advice is outdated. But you absolutely should change passwords that appear in a breach or that you typed on a suspicious site.' },
      { type: 'callout', kind: 'success', text: 'Quick check: run your most-used passwords through the CyberSafe Password Strength tool. It tells you the estimated crack time and whether the hash has been seen in known leaks.' },
    ],
  },
  {
    slug: 'how-to-identify-a-phishing-link',
    category: 'everyone',
    title: 'How to Identify a Phishing Link',
    excerpt:
      'Spot fake links and spoofed websites in seconds. Real-world examples, URL red flags, and simple habits that stop phishing cold.',
    cover: { emoji: '🎣', class: 'p3' },
    date: 'May 5, 2026',
    readTime: '6 min read',
    author: { name: 'Rohan Kapoor', initials: 'RK', role: 'Head of Research' },
    tags: ['phishing', 'beginner', 'browsing'],
    body: [
      { type: 'p', text: 'Phishing has gotten dramatically better. The "URGENT!! Click here!!" email is mostly history. Modern phishing emails copy real branding, use proper grammar, and even sit on HTTPS-encrypted sites with valid certificates. So how do you tell?' },
      { type: 'h2', text: 'Always read the domain right-to-left' },
      { type: 'p', text: 'The most important word in any URL is the one immediately before the first single slash. In "https://accounts.google.com.phishy.site/login", the real owner is phishy.site, not google.com.' },
      { type: 'h2', text: 'Five URL red flags' },
      { type: 'ul', items: [
        'Lookalike characters — paypa1.com vs paypal.com, rnicrosoft.com vs microsoft.com.',
        'Extra subdomains making the URL look "more legit" — secure-login.bankname-verify.com.',
        'Random hyphens or numbers — amazon-update-2026.com.',
        'IP addresses or random hex strings instead of a normal domain name.',
        'Top-level domains that don\'t match — google.com.support, microsoft.help.',
      ] },
      { type: 'h2', text: 'Hover before you click — every time' },
      { type: 'p', text: 'On desktop, hover any link to see the real URL at the bottom-left of your browser. On mobile, long-press the link to reveal the destination. The visible text and the real link can be wildly different.' },
      { type: 'callout', kind: 'warn', title: 'Even legitimate-looking',  text: 'Many phishing pages now have proper HTTPS and a padlock. The padlock means "the connection is encrypted" — not "the site is trustworthy". Always verify the domain.' },
      { type: 'h2', text: 'When in doubt — go directly' },
      { type: 'p', text: 'Got an email from your bank? Don\'t click — open a new tab and type the bank\'s URL yourself. It costs 10 seconds and removes 95% of phishing risk.' },
    ],
  },
  {
    slug: '5-signs-your-phone-may-be-compromised',
    category: 'everyone',
    title: '5 Signs Your Phone May Be Compromised',
    excerpt:
      'Unusual battery drain, mystery apps, strange pop-ups — discover the warning signs and what to do immediately.',
    cover: { emoji: '📱', class: 'p4' },
    date: 'Apr 28, 2026',
    readTime: '5 min read',
    author: { name: 'Ishita Khan', initials: 'IK', role: 'Community Manager' },
    tags: ['mobile', 'beginner', 'malware'],
    body: [
      { type: 'p', text: 'Mobile malware is no longer fringe. According to Lookout\'s 2026 report, around 1 in 60 Android devices has at least one risky app installed. iPhones are not immune either, especially if jailbroken or targeted by spyware. Here are the most reliable signs.' },
      { type: 'h2', text: '1. Battery drains way faster than usual' },
      { type: 'p', text: 'Spyware constantly reports your location, listens via the mic, and uploads data — all of which hammers the battery. If your phone goes from a full day to half a day for no obvious reason, dig into Settings → Battery and look for unfamiliar apps near the top.' },
      { type: 'h2', text: '2. Apps you don\'t remember installing' },
      { type: 'p', text: 'Scroll your full app list (not just the home screen). Anything you don\'t recognize? Tap, check the publisher, and uninstall if it looks suspicious.' },
      { type: 'h2', text: '3. Data usage spikes' },
      { type: 'p', text: 'A spyware app uploading recordings or screenshots will burn through cellular data. Settings → Network → Mobile data → per-app breakdown shows the truth.' },
      { type: 'h2', text: '4. The phone is hot when idle' },
      { type: 'p', text: 'A cool, locked phone shouldn\'t be warm. Sustained heat without you using it is a strong sign of background processing.' },
      { type: 'h2', text: '5. Pop-ups outside of any app' },
      { type: 'p', text: 'If you\'re seeing ads on your home screen or lock screen, an adware app has snuck in. These can\'t happen from legitimate browser ads.' },
      { type: 'callout', kind: 'success', title: 'Damage control', text: 'Uninstall suspicious apps, revoke their permissions, change the passwords for your important accounts from a different device, and run a reputable mobile antivirus scan (Malwarebytes, Bitdefender). In severe cases, factory-reset.' },
    ],
  },

  /* ────────── DEVELOPER ────────── */
  {
    slug: 'how-to-store-passwords-securely',
    category: 'dev',
    title: 'How to Store Passwords Securely — Never Plain Text',
    excerpt:
      'bcrypt, Argon2, salting explained with real code examples. The right way to handle user credentials in your app.',
    cover: { emoji: '🔑', class: 'd1' },
    date: 'May 20, 2026',
    readTime: '7 min read',
    difficulty: 'intermediate',
    author: { name: 'Vikram Nair', initials: 'VN', role: 'Security Engineer' },
    tags: ['passwords', 'crypto', 'backend'],
    body: [
      { type: 'p', text: 'Storing passwords correctly is one of those problems that seems trivial until the breach happens. Here is the modern, opinionated answer in 2026.' },
      { type: 'h2', text: 'Never store the password' },
      { type: 'p', text: 'Store a slow, salted hash of it. When the user logs in you hash their input the same way and compare. If the database leaks, attackers get hashes — not passwords.' },
      { type: 'h2', text: 'Pick the right algorithm' },
      { type: 'ul', items: [
        'Argon2id — current OWASP recommendation. Memory-hard, GPU-resistant.',
        'bcrypt — battle-tested for 25 years. Slower than Argon2id but ubiquitous.',
        'scrypt — fine if your runtime has it built-in.',
        'NEVER: MD5, SHA-1, SHA-256, SHA-512 — these are fast, single-shot, and built for hashing files, not protecting secrets.',
      ] },
      { type: 'h2', text: 'Argon2id in Node.js' },
      { type: 'code', language: 'js', text: `import argon2 from 'argon2'

const PARAMS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
}

export async function hash(password) {
  return argon2.hash(password, PARAMS)
}

export async function verify(hash, password) {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}` },
      { type: 'h2', text: 'bcrypt in Python' },
      { type: 'code', language: 'py', text: `import bcrypt

def hash_password(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12))

def verify(hashed: bytes, plain: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed)` },
      { type: 'callout', kind: 'warn', title: 'Tune for your hardware', text: 'A hash should take roughly 250–500ms to compute on your production server. Faster = easier to crack offline. Slower = bad UX. Benchmark before deploying.' },
      { type: 'h2', text: 'Salt is automatic with these libraries' },
      { type: 'p', text: 'You no longer need to manage salts manually — both bcrypt and argon2 store the salt and parameters inside the resulting hash string. One column, one value, done.' },
      { type: 'h2', text: 'Bonus: pepper' },
      { type: 'p', text: 'For high-value systems, add a server-side secret ("pepper") that is HMAC-mixed with the password before hashing. Keep the pepper outside the database (env var, KMS). If the DB leaks alone, attackers still can\'t crack hashes.' },
    ],
  },
  {
    slug: 'top-10-api-security-mistakes',
    category: 'dev',
    title: 'Top 10 API Security Mistakes Developers Make',
    excerpt:
      'From broken auth to mass assignment — real vulnerabilities found in production APIs and how to fix them.',
    cover: { emoji: '🔌', class: 'd2' },
    date: 'May 16, 2026',
    readTime: '9 min read',
    difficulty: 'advanced',
    author: { name: 'Vikram Nair', initials: 'VN', role: 'Security Engineer' },
    tags: ['api', 'auth', 'owasp'],
    body: [
      { type: 'p', text: 'OWASP\'s API Security Top 10 is updated for 2026. Here are the mistakes our pentest team flags the most often in real-world audits — and the fixes.' },
      { type: 'h2', text: '1. Broken Object Level Authorization (BOLA)' },
      { type: 'p', text: 'GET /api/users/123/orders/456 — and the server only checks that the JWT is valid, not that user 123 actually owns order 456. Result: any logged-in user reads any order by guessing IDs.' },
      { type: 'code', language: 'js', text: `// ❌ vulnerable
app.get('/orders/:id', auth, async (req, res) => {
  const order = await db.orders.findById(req.params.id)
  return res.json(order)
})

// ✅ fixed
app.get('/orders/:id', auth, async (req, res) => {
  const order = await db.orders.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })
  if (!order) return res.sendStatus(404)
  return res.json(order)
})` },
      { type: 'h2', text: '2. Mass assignment' },
      { type: 'p', text: 'Spreading req.body straight into your ORM update lets clients flip privileged fields ("role": "admin"). Always use an allowlist.' },
      { type: 'h2', text: '3. Excessive data exposure' },
      { type: 'p', text: 'Returning the entire user object on /me leaks password hashes, tokens, and internal flags. Define a serializer per endpoint.' },
      { type: 'h2', text: '4. Lack of rate-limiting' },
      { type: 'p', text: 'No throttling on /login = credential stuffing. No throttling on /password-reset = enumeration. Use Redis token-bucket or a CDN-level rule.' },
      { type: 'h2', text: '5. Verbose error messages' },
      { type: 'p', text: 'Returning "user not found" vs "wrong password" hands attackers a free user-enumeration oracle. Use a single generic error.' },
      { type: 'h2', text: '6. Weak JWT validation' },
      { type: 'ul', items: [
        'Validate the alg header against an allowlist — never trust "none".',
        'Verify with the correct key per kid.',
        'Check exp, nbf, iss, aud on every request.',
        'Rotate the signing key periodically and support multiple active kids.',
      ] },
      { type: 'h2', text: '7. CORS misconfiguration' },
      { type: 'p', text: 'Access-Control-Allow-Origin: * + Access-Control-Allow-Credentials: true is functionally equivalent to "everyone in the world can read this endpoint with the victim\'s cookies". Always pin to known origins.' },
      { type: 'h2', text: '8. Server-side request forgery (SSRF)' },
      { type: 'p', text: 'Any endpoint that fetches a URL on behalf of the client (image proxy, webhook tester) must block private IP ranges, link-local, and metadata endpoints (169.254.169.254).' },
      { type: 'h2', text: '9. Missing security headers' },
      { type: 'p', text: 'Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy. Use Helmet (Node), django-csp, or your framework\'s middleware.' },
      { type: 'h2', text: '10. No logging of auth events' },
      { type: 'p', text: 'Without structured logs of login attempts, role changes, and token issuance, you cannot detect — let alone investigate — an incident.' },
    ],
  },
  {
    slug: 'sql-injection-explained',
    category: 'dev',
    title: 'SQL Injection — How It Works & How to Prevent It',
    excerpt:
      'A hands-on breakdown of SQL injection with live examples and parameterized query solutions in Python, Node & PHP.',
    cover: { emoji: '💉', class: 'd3' },
    date: 'May 12, 2026',
    readTime: '8 min read',
    difficulty: 'beginner',
    author: { name: 'Priya Mehta', initials: 'PM', role: 'Co-founder & CTO' },
    tags: ['sql', 'injection', 'beginner'],
    body: [
      { type: 'p', text: 'SQL injection has been the #1 web vulnerability for two decades because it is trivially easy to introduce and devastating in impact. Here is the modern view.' },
      { type: 'h2', text: 'The classic vulnerable query' },
      { type: 'code', language: 'py', text: `# ❌ NEVER do this
cursor.execute(
    "SELECT * FROM users WHERE email = '" + email + "'"
)` },
      { type: 'p', text: 'If a user submits ' + "' OR 1=1 --" + ' as the email, the executed SQL becomes:' },
      { type: 'code', language: 'sql', text: `SELECT * FROM users WHERE email = '' OR 1=1 --'` },
      { type: 'p', text: 'Which returns every user in the database. With UNION SELECT they can read other tables, or drop them entirely.' },
      { type: 'h2', text: 'The fix: parameterized queries' },
      { type: 'code', language: 'py', text: `# ✅ Python — psycopg
cursor.execute(
    "SELECT * FROM users WHERE email = %s",
    (email,),
)` },
      { type: 'code', language: 'js', text: `// ✅ Node — pg
await client.query(
  'SELECT * FROM users WHERE email = $1',
  [email],
)` },
      { type: 'code', language: 'php', text: `// ✅ PHP — PDO
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);` },
      { type: 'callout', kind: 'info', title: 'Why this works', text: 'The driver sends the query template and the parameters separately to the database. The parameters are never interpreted as SQL — they are pure data.' },
      { type: 'h2', text: 'What about ORMs?' },
      { type: 'p', text: 'Modern ORMs (Prisma, SQLAlchemy, ActiveRecord, Hibernate) parameterize everything by default. The danger is escaping that safety: raw() queries, string interpolation in WHERE clauses, dynamic ORDER BY columns. Always treat user input as untrusted.' },
      { type: 'h2', text: 'Dynamic ORDER BY done safely' },
      { type: 'code', language: 'js', text: `const ALLOWED = new Set(['name', 'created_at', 'price'])
const sort = ALLOWED.has(req.query.sort) ? req.query.sort : 'created_at'
const sql = \`SELECT * FROM items ORDER BY \${sort} LIMIT 100\`` },
      { type: 'p', text: 'Column names cannot be parameterized in standard SQL, so you must validate against an allowlist. Never interpolate the value directly.' },
    ],
  },
  {
    slug: 'securing-jwts',
    category: 'dev',
    title: 'Securing JWTs: What Most Tutorials Get Wrong',
    excerpt:
      'Algorithm confusion, "none" attacks, insecure storage — the JWT pitfalls that silently break your auth layer.',
    cover: { emoji: '🪙', class: 'd1' },
    date: 'May 8, 2026',
    readTime: '6 min read',
    difficulty: 'intermediate',
    author: { name: 'Vikram Nair', initials: 'VN', role: 'Security Engineer' },
    tags: ['jwt', 'auth', 'crypto'],
    body: [
      { type: 'p', text: 'JWTs are great when used correctly and a footgun otherwise. Here are the five mistakes that show up in nearly every JWT-based codebase we audit.' },
      { type: 'h2', text: '1. Trusting the alg header' },
      { type: 'p', text: 'Older libraries would honour alg="none" and skip verification. Pin the expected algorithm in code, not from the token.' },
      { type: 'h2', text: '2. Storing tokens in localStorage' },
      { type: 'p', text: 'Any XSS gives the attacker your tokens. Use httpOnly Secure SameSite=Lax cookies for sessions, and reserve JWTs for stateless API calls where cookies are inconvenient.' },
      { type: 'h2', text: '3. Never expiring' },
      { type: 'p', text: 'A 30-day token that you cannot invalidate is a 30-day liability. Use short access tokens (15 min) + refresh tokens kept in a revocable store.' },
      { type: 'h2', text: '4. Putting secrets in the payload' },
      { type: 'p', text: 'JWT payloads are base64-encoded, not encrypted. Anyone who has the token can read everything inside it. Use JWE if you need encryption.' },
      { type: 'h2', text: '5. Not rotating keys' },
      { type: 'p', text: 'Use the kid header to support multiple active signing keys, and rotate them on a schedule. If a key leaks, you can revoke that kid in minutes instead of breaking every user.' },
    ],
  },
  {
    slug: 'owasp-top-10-explained',
    category: 'dev',
    title: 'OWASP Top 10 Explained with Code Examples',
    excerpt:
      'Every item on the OWASP list broken down with vulnerable code snippets and secure alternatives side-by-side.',
    cover: { emoji: '📋', class: 'd2' },
    date: 'May 3, 2026',
    readTime: '12 min read',
    difficulty: 'advanced',
    author: { name: 'Rohan Kapoor', initials: 'RK', role: 'Head of Research' },
    tags: ['owasp', 'web', 'advanced'],
    body: [
      { type: 'p', text: 'The OWASP Top 10 has been the de-facto checklist for web security since 2003. The 2026 edition reshuffled a few categories — here is a quick run-through with one concrete example per item.' },
      { type: 'h2', text: 'A01 — Broken Access Control' },
      { type: 'p', text: 'Already covered in our API mistakes post: verify the requested resource belongs to the authenticated user on every endpoint.' },
      { type: 'h2', text: 'A02 — Cryptographic Failures' },
      { type: 'p', text: 'Don\'t roll your own crypto, don\'t use MD5/SHA-1 for secrets, force TLS 1.2+. Use vetted libraries.' },
      { type: 'h2', text: 'A03 — Injection' },
      { type: 'p', text: 'Parameterize SQL, escape shell args, validate JSON schemas. Treat every input as hostile.' },
      { type: 'h2', text: 'A04 — Insecure Design' },
      { type: 'p', text: 'Threat-model before you code. A password-reset flow that emails the user\'s plaintext password is a design failure no amount of clean code can fix.' },
      { type: 'h2', text: 'A05 through A10' },
      { type: 'p', text: 'Security Misconfiguration, Vulnerable Components, Identification/Authentication failures, Software & Data Integrity, Security Logging, and SSRF. Each could be its own post — and they will be. Subscribe to get them as they land.' },
    ],
  },
  {
    slug: 'set-up-https-the-right-way',
    category: 'dev',
    title: 'How to Set Up HTTPS the Right Way',
    excerpt:
      'SSL/TLS configuration, HSTS headers, certificate pinning — a complete HTTPS checklist for your web app.',
    cover: { emoji: '🔐', class: 'd3' },
    date: 'Apr 28, 2026',
    readTime: '5 min read',
    difficulty: 'beginner',
    author: { name: 'Aarav Sharma', initials: 'AS', role: 'Co-founder & CEO' },
    tags: ['tls', 'https', 'beginner'],
    body: [
      { type: 'p', text: 'A 2026 HTTPS setup is mostly a matter of pointing at Let\'s Encrypt and enabling a few headers. Here is the minimum viable secure config.' },
      { type: 'h2', text: 'Use TLS 1.2 and 1.3, disable everything older' },
      { type: 'p', text: 'SSL 3, TLS 1.0, TLS 1.1 are insecure and deprecated. Most modern web servers default to TLS 1.2+, but verify with ssllabs.com.' },
      { type: 'h2', text: 'Get a free certificate from Let\'s Encrypt' },
      { type: 'code', language: 'shell', text: `sudo certbot --nginx -d example.com -d www.example.com` },
      { type: 'h2', text: 'Add HSTS' },
      { type: 'code', language: 'http', text: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` },
      { type: 'p', text: 'This tells browsers: "for the next two years, only ever connect to me over HTTPS, no matter what". Add yourself to the HSTS preload list once you\'re confident.' },
      { type: 'h2', text: 'Redirect HTTP to HTTPS' },
      { type: 'p', text: 'A bare http:// request should always 301 to the https:// version. Nginx one-liner: return 301 https://$host$request_uri;' },
      { type: 'callout', kind: 'success', text: 'Run your site through SSL Labs after deploying. You want at least an A grade.' },
    ],
  },

  /* ────────── BUSINESS ────────── */
  {
    slug: 'gdpr-and-cybersecurity',
    category: 'biz',
    title: 'GDPR & Cybersecurity: What Your Business Must Know',
    excerpt:
      "Data protection compliance isn't optional. Here's what GDPR requires from your security posture in 2026.",
    cover: { emoji: '📜', class: 'b1' },
    date: 'May 18, 2026',
    readTime: '8 min read',
    author: { name: 'Priya Mehta', initials: 'PM', role: 'Co-founder & CTO' },
    tags: ['gdpr', 'compliance', 'business'],
    body: [
      { type: 'p', text: 'GDPR is now eight years old and enforcement has matured. The headline fines (Meta\'s €1.2B, Amazon\'s €746M) make news, but most penalties are mid-six-figure hits on companies that thought they were too small to matter.' },
      { type: 'h2', text: 'Core security obligations' },
      { type: 'ul', items: [
        'Encrypt personal data at rest and in transit.',
        'Implement role-based access control with logging.',
        'Run regular vulnerability scans and document the results.',
        'Have a tested incident response plan (Article 33 requires breach notification within 72 hours).',
        'Sign Data Processing Agreements with every vendor that touches user data.',
      ] },
      { type: 'h2', text: 'The 72-hour breach notification rule' },
      { type: 'p', text: 'If you suffer a breach of personal data, you have 72 hours from awareness to notify your supervisory authority. Most companies fail this because they don\'t have a playbook — they spend the first day deciding who is in charge.' },
      { type: 'callout', kind: 'warn', title: 'Common mistake', text: 'Treating "we are not in the EU" as a pass. GDPR applies to any business processing EU residents\' data, regardless of where the company is incorporated.' },
      { type: 'h2', text: 'A minimal compliance program' },
      { type: 'ol', items: [
        'Map your data — what you collect, where it lives, who can access it.',
        'Publish a clear privacy policy with the GDPR-required information.',
        'Appoint a Data Protection Officer if you process at scale or sensitive data.',
        'Run a Data Protection Impact Assessment (DPIA) for any high-risk processing.',
        'Train your staff annually and document the training.',
      ] },
    ],
  },
  {
    slug: 'incident-response-plan-template',
    category: 'biz',
    title: 'Incident Response Plan: A Step-by-Step Template',
    excerpt:
      'When a breach happens, every minute counts. Build a response plan before you need one with this ready-to-use template.',
    cover: { emoji: '🚨', class: 'b2' },
    date: 'May 11, 2026',
    readTime: '10 min read',
    author: { name: 'Rohan Kapoor', initials: 'RK', role: 'Head of Research' },
    tags: ['incident-response', 'business', 'compliance'],
    body: [
      { type: 'p', text: 'Most companies that fail a breach don\'t fail at containment — they fail at coordination. People don\'t know who to call, who has authority, or what the legal clock is. Here is a 6-phase plan you can adopt today.' },
      { type: 'h2', text: 'Phase 1 — Preparation (before any incident)' },
      { type: 'ul', items: [
        'Define an incident response team with named primary and backup contacts.',
        'Maintain an asset inventory and a data-flow diagram.',
        'Establish secure out-of-band communication (e.g. Signal group).',
        'Run a tabletop exercise quarterly.',
      ] },
      { type: 'h2', text: 'Phase 2 — Identification' },
      { type: 'p', text: 'Detect, classify, and assign severity. Use a 4-level scale: P1 (active data exfiltration), P2 (confirmed access), P3 (credible suspicion), P4 (low/noise).' },
      { type: 'h2', text: 'Phase 3 — Containment' },
      { type: 'p', text: 'Short-term: isolate affected systems, rotate credentials, block IPs. Long-term: harden the entry point so the attacker can\'t come back.' },
      { type: 'h2', text: 'Phase 4 — Eradication' },
      { type: 'p', text: 'Remove the malware, patch the vulnerability, validate clean state. Do not skip this phase to get back online faster — you will only re-incident.' },
      { type: 'h2', text: 'Phase 5 — Recovery' },
      { type: 'p', text: 'Restore from clean backups, monitor for re-infection signals, communicate restored status to stakeholders.' },
      { type: 'h2', text: 'Phase 6 — Lessons learned' },
      { type: 'p', text: 'Within 2 weeks, write a blameless post-mortem. What did we miss? What controls would have prevented this? Update the runbook and re-train.' },
      { type: 'callout', kind: 'info', text: 'Email biz@cybersafe.app for our free incident-response template (Markdown + Notion + Confluence formats).' },
    ],
  },
  {
    slug: 'employee-security-training',
    category: 'biz',
    title: "Employee Security Training: Why It's Your Strongest Defense",
    excerpt:
      "91% of breaches start with a phishing email. Here's how to build a security-aware culture in your organization.",
    cover: { emoji: '🧑‍💼', class: 'b3' },
    date: 'May 4, 2026',
    readTime: '6 min read',
    author: { name: 'Ishita Khan', initials: 'IK', role: 'Community Manager' },
    tags: ['training', 'culture', 'business'],
    body: [
      { type: 'p', text: 'You can spend a million dollars on EDR and firewall appliances, and one untrained employee can still hand the attacker domain admin in three clicks. Here is how to build a security culture that scales.' },
      { type: 'h2', text: 'Stop the annual click-through training' },
      { type: 'p', text: '60-minute compliance modules don\'t move the needle. People skim, click "I agree", and forget within a week. Replace it with short, frequent, contextual lessons.' },
      { type: 'h2', text: 'Run quarterly phishing simulations' },
      { type: 'p', text: 'Realistic, varied templates — not the same "your account is suspended" every time. Pair each simulation with a 60-second teaching moment for those who click.' },
      { type: 'h2', text: 'Reward, don\'t shame' },
      { type: 'p', text: 'People who fall for a test should get extra training, not public ridicule. People who report a real phish should get recognized in the all-hands.' },
      { type: 'h2', text: 'Make it easy to report' },
      { type: 'p', text: 'A one-click "Report Phishing" button in your mail client outperforms any policy document. The faster reports come in, the faster your security team can contain.' },
      { type: 'callout', kind: 'success', title: 'Measure what matters', text: 'Track three metrics: click rate on simulated phish, report rate on real phish, and time-to-report. All three should improve quarter over quarter.' },
    ],
  },
]

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getRelatedPosts(post, limit = 3) {
  return BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  ).slice(0, limit)
}

export function countByCategory() {
  return BLOG_POSTS.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      acc.all += 1
      return acc
    },
    { all: 0 },
  )
}
