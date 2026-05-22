/**
 * Structured guide content. Each guide is a series of numbered steps;
 * each step is a list of content blocks (same schema as blog posts).
 */

export const LEVEL_META = {
  beginner:     { label: 'Beginner',     icon: '✅', color: '#22c55e' },
  intermediate: { label: 'Intermediate', icon: '⚡', color: '#f59e0b' },
  advanced:     { label: 'Advanced',     icon: '🔥', color: '#ef4444' },
}

export const GUIDES = [
  /* ─────────────── 1. PASSWORDS (beginner) ─────────────── */
  {
    slug: 'strong-password-passphrase',
    level: 'beginner',
    icon: '🔑',
    cover: 'blue',
    tag: 'Passwords',
    tagClass: '',
    title: 'How to Build a Strong Password You Can Actually Remember',
    desc: 'A passphrase approach that beats most password managers — without the sticky-notes.',
    meta: '12 min · Beginner',
    readTime: 12,
    publishedAt: '2026-04-12',
    author: { name: 'Aanya Sharma', role: 'Security Educator' },
    learnings: [
      'Why length beats complexity every time',
      'How to generate a memorable 4-word passphrase',
      'When to upgrade to a password manager',
    ],
    prerequisites: [
      'A pen and a piece of paper (you won\'t keep it — promise)',
      '5 minutes of quiet focus',
    ],
    steps: [
      {
        title: 'Understand why your current password is weak',
        time: '2 min',
        blocks: [
          { type: 'p', text: "Most passwords fail in one of three ways: they're too short, they're a single dictionary word, or they're built from personal details an attacker can find on social media." },
          { type: 'p', text: 'A modern GPU can guess 10 billion passwords per second. At that rate, an 8-character mixed-case password falls in under an hour. Length is the only thing that scales.' },
          { type: 'callout', kind: 'info', title: 'Rule of thumb', text: 'Each additional character roughly doubles the time to crack. 16 characters is the new minimum for accounts that matter.' },
        ],
      },
      {
        title: 'Pick four random, unrelated words',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'Open a book to a random page. Pick the first noun, verb, adjective, then noun you see. Or use this prompt:' },
          { type: 'callout', kind: 'tip', text: 'Mountain · Velvet · Tractor · Hyena' },
          { type: 'p', text: "That's 25+ characters of entropy. Even with a perfect dictionary attack at 10B guesses/sec, you're looking at thousands of years." },
        ],
      },
      {
        title: 'Add a sprinkle of grit',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Insert a digit between two words and a symbol at the end. Capitalise one letter you can remember.' },
          { type: 'code', language: 'plaintext', text: 'Mountain42velvet!Tractor-Hyena' },
          { type: 'p', text: 'Now create a story: "On Monday I rode a velvet TRACTOR up a mountain chasing 42 hyenas." Read it once, write it once, recall it twice. Done — you\'ll never forget it.' },
        ],
      },
      {
        title: 'Use it everywhere? Absolutely not.',
        time: '3 min',
        blocks: [
          { type: 'p', text: "Even a perfect password becomes worthless if you reuse it. One breached site = every account compromised." },
          { type: 'p', text: 'Use this passphrase only for your password-manager master password. Let the manager generate everything else — and pair it with two-factor authentication.' },
          { type: 'callout', kind: 'warn', title: 'Never do this', text: 'Don\'t store this password in a notes app, browser auto-fill that\'s not encrypted, or a sticky note on your monitor.' },
        ],
      },
      {
        title: 'Test it',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Run your new passphrase through our checker:' },
          { type: 'ol', items: [
            'Open the Password Strength tool.',
            'Type your candidate passphrase.',
            'Confirm the estimated crack time exceeds "thousands of years".',
            'Check it isn\'t in any known breach list.',
          ] },
        ],
      },
    ],
    relatedSlugs: ['enable-2fa-everywhere', 'email-account-hacked-runbook'],
  },

  /* ─────────────── 2. EMAIL PHISHING (beginner) ─────────────── */
  {
    slug: 'spot-phishing-email-30-seconds',
    level: 'beginner',
    icon: '📧',
    cover: 'amber',
    tag: 'Email',
    tagClass: 'amber',
    title: 'Spot a Phishing Email in 30 Seconds',
    desc: 'The 5 red flags every phishing message gives away, with real-world examples.',
    meta: '8 min · Beginner',
    readTime: 8,
    publishedAt: '2026-04-18',
    author: { name: 'Marcus Webb', role: 'Anti-Fraud Analyst' },
    learnings: [
      'Read sender domains like an expert',
      'Recognise the 5 emotional triggers phishers use',
      'Know exactly what to do with a suspicious email',
    ],
    prerequisites: [
      'Access to your email inbox',
      'Curiosity and a healthy paranoia',
    ],
    steps: [
      {
        title: 'Check the sender domain first — always',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'The display name lies. The domain almost never does. Hover the From address and look at what comes after the @.' },
          { type: 'callout', kind: 'warn', title: 'Spot the typosquat', text: 'support@app1e-id.com → not Apple. support@arnazon.com → not Amazon. The number "1" replacing "l" and "rn" replacing "m" are classics.' },
        ],
      },
      {
        title: 'Read URLs right-to-left',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'The real domain is the part immediately before the first single slash, working backwards. Everything before that is just decoration.' },
          { type: 'code', language: 'plaintext', text: 'https://amazon.com.secure-login.ru/signin\n                  ↑ real domain is secure-login.ru' },
          { type: 'p', text: 'On mobile, long-press the link to preview the URL before tapping.' },
        ],
      },
      {
        title: 'Spot the emotional trigger',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Phishing emails reliably exploit one of five emotions:' },
          { type: 'ul', items: [
            '⏰ Urgency — "Action required within 24 hours"',
            '😱 Fear — "Your account will be permanently disabled"',
            '🎁 Greed — "You\'ve won a $500 Amazon gift card"',
            '👔 Authority — "From the desk of the CEO"',
            '🤝 Trust — "Re: invoice you requested" (you didn\'t)',
          ] },
          { type: 'p', text: 'If a message makes you feel one of these strongly, slow down. Real organisations never demand instant action over email.' },
        ],
      },
      {
        title: 'Verify out-of-band',
        time: '1 min',
        blocks: [
          { type: 'p', text: 'Don\'t click the link inside the suspicious email. Open a new tab, type the official URL yourself, and log in. If the message was legitimate, you\'ll see the same notification in your account.' },
        ],
      },
      {
        title: 'Report and delete',
        time: '1 min',
        blocks: [
          { type: 'ol', items: [
            'Forward the email to reportphishing@apwg.org and to the brand being impersonated (e.g. abuse@paypal.com).',
            'Mark as phishing in Gmail/Outlook — this trains the spam filter.',
            'Delete from inbox and trash.',
          ] },
          { type: 'callout', kind: 'tip', text: 'Take our 5-minute Phishing Awareness quiz to stress-test what you just learned.' },
        ],
      },
    ],
    relatedSlugs: ['enable-2fa-everywhere', 'email-account-hacked-runbook'],
  },

  /* ─────────────── 3. 2FA (beginner) ─────────────── */
  {
    slug: 'enable-2fa-everywhere',
    level: 'beginner',
    icon: '🔐',
    cover: 'green',
    tag: 'Setup',
    tagClass: 'green',
    title: 'Turn On Two-Factor Authentication Everywhere',
    desc: 'Step-by-step screenshots for Gmail, Instagram, banking apps, WhatsApp, and more.',
    meta: '15 min · Beginner',
    readTime: 15,
    publishedAt: '2026-04-22',
    author: { name: 'Priya Iyer', role: 'Account Security Lead' },
    learnings: [
      'Pick the right 2FA method for each account',
      'Set up an authenticator app (the right way)',
      'Save backup codes so you don\'t get locked out',
    ],
    prerequisites: [
      'A smartphone (iOS or Android)',
      'List of accounts you want to protect',
    ],
    steps: [
      {
        title: 'Install an authenticator app',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'Skip SMS-based 2FA where possible — SIM swaps make it weak. Install one of these authenticator apps instead:' },
          { type: 'ul', items: [
            'Google Authenticator (free, simple)',
            'Microsoft Authenticator (free, cloud backup)',
            'Authy (free, multi-device sync)',
            '1Password / Bitwarden (built into your password manager)',
          ] },
        ],
      },
      {
        title: 'Protect your email account first',
        time: '4 min',
        blocks: [
          { type: 'p', text: 'Your email is the master key to almost every other account through password resets. Lock it down before anything else.' },
          { type: 'ol', items: [
            'Open Gmail / Outlook security settings.',
            'Find "2-Step Verification" or "Two-factor authentication".',
            'Choose Authenticator App as your primary method.',
            'Scan the QR code with your authenticator.',
            'Enter the 6-digit code to confirm.',
          ] },
          { type: 'callout', kind: 'warn', title: 'Don\'t skip this', text: 'Download or print the backup codes. Store them in your password manager or a fire-safe drawer. They\'re your only way back in if you lose your phone.' },
        ],
      },
      {
        title: 'Add 2FA to financial accounts',
        time: '4 min',
        blocks: [
          { type: 'p', text: 'Banking, brokerage, crypto, PayPal, Venmo — all of them. Most now support authenticator apps; a few still require SMS. Use what they offer.' },
          { type: 'callout', kind: 'tip', text: 'For crypto exchanges specifically: use a hardware security key (YubiKey) if supported. SMS 2FA has been bypassed in dozens of crypto hacks.' },
        ],
      },
      {
        title: 'Cover social and messaging apps',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'These accounts are how attackers impersonate you to scam friends and family. Enable 2FA on:' },
          { type: 'ul', items: [
            'Instagram (Settings → Security → Two-factor)',
            'WhatsApp (Settings → Account → Two-step verification)',
            'Facebook (Settings → Security & Login)',
            'TikTok, Snapchat, X — same pattern',
          ] },
        ],
      },
      {
        title: 'Prepare for phone loss',
        time: '1 min',
        blocks: [
          { type: 'p', text: 'Test that your backup codes work. Add a second authenticator method (e.g. Authy on a tablet) so a lost phone doesn\'t become a lockout.' },
        ],
      },
    ],
    relatedSlugs: ['strong-password-passphrase', 'email-account-hacked-runbook'],
  },

  /* ─────────────── 4. BROWSER PRIVACY (intermediate) ─────────────── */
  {
    slug: 'browser-privacy-speed',
    level: 'intermediate',
    icon: '🌐',
    cover: 'purple',
    tag: 'Browsing',
    tagClass: 'purple',
    title: 'Configure Your Browser for Privacy & Speed',
    desc: 'Recommended Chrome, Firefox, Brave, and Edge settings to block trackers and ads.',
    meta: '20 min · Intermediate',
    readTime: 20,
    publishedAt: '2026-04-28',
    author: { name: 'Diego Martín', role: 'Browser Security Researcher' },
    learnings: [
      'Pick the best browser for your threat model',
      'Install the right (small) set of extensions',
      'Disable telemetry without breaking the web',
    ],
    prerequisites: [
      'Admin access on your computer',
      'A list of sites that must keep working',
    ],
    steps: [
      {
        title: 'Choose a privacy-respecting browser',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'In order of out-of-the-box privacy:' },
          { type: 'ol', items: [
            'Brave — ad and tracker blocking on by default, Tor mode included',
            'Firefox — most customisable, strong tracking protection',
            'Safari (macOS/iOS) — solid defaults, Apple ecosystem',
            'Edge — better than Chrome, still Microsoft telemetry',
            'Chrome — most market share, weakest privacy story',
          ] },
        ],
      },
      {
        title: 'Install only two extensions',
        time: '5 min',
        blocks: [
          { type: 'p', text: 'Every extension expands your attack surface. Be ruthless. Most people need only two:' },
          { type: 'ul', items: [
            'uBlock Origin — ads, trackers, malware domains. Skip "AdBlock" — it\'s not the same thing.',
            'Bitwarden / 1Password — your password manager',
          ] },
          { type: 'callout', kind: 'warn', title: 'Resist the urge', text: 'Skip "PDF readers", "screenshot tools", and "weather widgets". They\'re the leading source of browser-level data leaks.' },
        ],
      },
      {
        title: 'Turn off the noisy defaults',
        time: '6 min',
        blocks: [
          { type: 'p', text: 'In your browser settings:' },
          { type: 'ul', items: [
            'Enable "Do Not Track" and "Send Global Privacy Control"',
            'Set tracking protection to Strict',
            'Block third-party cookies',
            'Disable autofill for payment details (use your password manager instead)',
            'Disable hardware acceleration only if you see flickering',
            'Turn off "Improve searches" / "Help make this browser better" telemetry',
          ] },
        ],
      },
      {
        title: 'Pick a private search engine',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Change your default search to one that doesn\'t profile you:' },
          { type: 'ul', items: [
            'DuckDuckGo — best results, decent privacy',
            'Brave Search — independent index, no profiling',
            'Startpage — Google results, no tracking',
          ] },
        ],
      },
      {
        title: 'Test what you blocked',
        time: '4 min',
        blocks: [
          { type: 'p', text: 'Open these in a new tab to see what\'s still leaking:' },
          { type: 'ul', items: [
            'coveryourtracks.eff.org — measures fingerprint uniqueness',
            'browserleaks.com — detailed leak audit',
            'dnsleaktest.com — verify your DNS resolver',
          ] },
          { type: 'callout', kind: 'tip', text: "If your fingerprint is highly unique, you're still trackable. Brave's shields or Firefox's resistFingerprinting setting fix this." },
        ],
      },
    ],
    relatedSlugs: ['dns-level-ad-blocking', 'lock-down-smartphone'],
  },

  /* ─────────────── 5. SMARTPHONE (intermediate) ─────────────── */
  {
    slug: 'lock-down-smartphone',
    level: 'intermediate',
    icon: '📱',
    cover: 'rose',
    tag: 'Mobile',
    tagClass: 'rose',
    title: 'Lock Down Your Smartphone in 10 Steps',
    desc: 'Permissions, app review, encrypted backups, and the one toggle most people miss.',
    meta: '18 min · Intermediate',
    readTime: 18,
    publishedAt: '2026-05-03',
    author: { name: 'Sara Okafor', role: 'Mobile Security Engineer' },
    learnings: [
      'Audit and shrink app permissions',
      'Enable encrypted backups properly',
      'Block tracking pixels and ID resets',
    ],
    prerequisites: [
      'iPhone (iOS 17+) or Android (12+)',
      '20 minutes of uninterrupted phone time',
    ],
    steps: [
      {
        title: 'Update everything',
        time: '5 min',
        blocks: [
          { type: 'p', text: "OS and app updates close most security holes. Don't delay them." },
          { type: 'ul', items: [
            'Settings → General → Software Update (iOS)',
            'Settings → System → System update (Android)',
            'App Store / Play Store → enable auto-update',
          ] },
        ],
      },
      {
        title: 'Use a long passcode + biometrics',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'A 4-digit PIN falls in seconds with the right tool. Use at least 6 digits, ideally an alphanumeric passcode. Then enable Face ID / fingerprint for daily unlocks.' },
        ],
      },
      {
        title: 'Audit every app permission',
        time: '5 min',
        blocks: [
          { type: 'p', text: 'Go through Privacy / Permissions and revoke aggressively. Common offenders:' },
          { type: 'ul', items: [
            'Location: switch to "While Using" instead of "Always"',
            'Microphone, Camera: disable for any app that doesn\'t obviously need them',
            'Photos: grant access to "Selected Photos" rather than the whole library',
            'Contacts: revoke for everything except messaging apps',
          ] },
        ],
      },
      {
        title: 'Disable advertising identifiers',
        time: '1 min',
        blocks: [
          { type: 'ul', items: [
            'iOS: Settings → Privacy → Tracking → off',
            'iOS: Settings → Privacy → Apple Advertising → off',
            'Android: Settings → Privacy → Ads → Delete advertising ID',
          ] },
        ],
      },
      {
        title: 'Lock down lock-screen access',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Anyone with your locked phone can still do a lot if you don\'t disable these:' },
          { type: 'ul', items: [
            'Notification previews → "When unlocked" only',
            'Reply from lock screen → off',
            'Wallet & control center on lock screen → off',
            'Siri / Google Assistant when locked → off',
          ] },
        ],
      },
      {
        title: 'Encrypt your backups',
        time: '3 min',
        blocks: [
          { type: 'callout', kind: 'tip', title: 'The toggle most people miss', text: 'iTunes/Finder backups aren\'t encrypted by default. Tick the "Encrypt local backup" box and set a strong password. This also unlocks backing up Health and Keychain data.' },
        ],
      },
    ],
    relatedSlugs: ['browser-privacy-speed', 'backup-strategy-personal'],
  },

  /* ─────────────── 6. BACKUPS (intermediate) ─────────────── */
  {
    slug: 'backup-strategy-personal',
    level: 'intermediate',
    icon: '💾',
    cover: 'slate',
    tag: 'Backup',
    tagClass: '',
    title: 'A Sane Backup Strategy for Personal Data',
    desc: 'The 3-2-1 rule explained with free tools — never lose photos or documents again.',
    meta: '14 min · Intermediate',
    readTime: 14,
    publishedAt: '2026-05-08',
    author: { name: 'Helena Pope', role: 'Data Reliability Engineer' },
    learnings: [
      'Apply the 3-2-1 backup rule in real life',
      'Choose between local, cloud, and hybrid options',
      'Test backups so you actually have one',
    ],
    prerequisites: [
      'An external drive (any size will do)',
      'A free cloud storage account',
    ],
    steps: [
      {
        title: 'Learn the 3-2-1 rule',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'The classic IT rule, simplified for personal use:' },
          { type: 'ul', items: [
            '3 copies of every file',
            '2 different storage media (e.g. SSD + cloud)',
            '1 copy off-site (cloud or a friend\'s house)',
          ] },
          { type: 'callout', kind: 'info', title: 'Why three?', text: 'One copy = no backup. Two copies = one accident from disaster. Three is the minimum that survives any single failure.' },
        ],
      },
      {
        title: 'Inventory what matters',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'You don\'t need to back up everything. Make a list of the irreplaceable:' },
          { type: 'ul', items: [
            'Photos and videos',
            'Identity documents (passport scans, certificates)',
            'Tax records (last 7 years)',
            'Personal projects, writing, code',
            'Password manager export (encrypted)',
          ] },
        ],
      },
      {
        title: 'Set up the local copy',
        time: '4 min',
        blocks: [
          { type: 'p', text: 'Grab an external SSD (~₹3,000 for 1TB). Use built-in tools:' },
          { type: 'ul', items: [
            'macOS: Time Machine — automatic incremental backups',
            'Windows: File History + occasional full image (Macrium Reflect Free)',
            'Linux: rsync or Déjà Dup',
          ] },
        ],
      },
      {
        title: 'Add the cloud copy',
        time: '3 min',
        blocks: [
          { type: 'p', text: 'For off-site protection, pick one:' },
          { type: 'ul', items: [
            'iCloud / Google One / OneDrive — easy, OS-integrated',
            'Backblaze — $9/month unlimited, great for photos',
            'Proton Drive / Cryptomator + any cloud — end-to-end encrypted',
          ] },
        ],
      },
      {
        title: 'Test it (the part everyone skips)',
        time: '2 min',
        blocks: [
          { type: 'callout', kind: 'warn', title: 'Backups you haven\'t tested don\'t exist', text: "Every 6 months, pick a random file and try to restore it from each copy. Set a calendar reminder right now — seriously." },
        ],
      },
    ],
    relatedSlugs: ['lock-down-smartphone', 'email-account-hacked-runbook'],
  },

  /* ─────────────── 7. DNS BLOCKING (advanced) ─────────────── */
  {
    slug: 'dns-level-ad-blocking',
    level: 'advanced',
    icon: '🛡️',
    cover: 'green',
    tag: 'Network',
    tagClass: 'green',
    title: 'Set Up DNS-Level Ad and Tracker Blocking',
    desc: 'Use NextDNS, Pi-hole, or AdGuard Home to protect every device on your network.',
    meta: '35 min · Advanced',
    readTime: 35,
    publishedAt: '2026-05-12',
    author: { name: 'Kenji Watanabe', role: 'Network Engineer' },
    learnings: [
      'Pick between hosted (NextDNS) and self-hosted (Pi-hole)',
      'Configure DNS-over-HTTPS / TLS for every device',
      'Maintain blocklists without breaking the web',
    ],
    prerequisites: [
      'Router admin access',
      'Optional: Raspberry Pi or always-on machine for Pi-hole',
    ],
    steps: [
      {
        title: 'Pick your weapon',
        time: '3 min',
        blocks: [
          { type: 'ul', items: [
            'NextDNS — hosted, $20/year, works on any device, easiest',
            'Pi-hole — self-hosted on a Pi, full control, no subscription',
            'AdGuard Home — self-hosted, more user-friendly than Pi-hole',
          ] },
          { type: 'p', text: 'For most people, NextDNS is the right answer. Self-host only if you enjoy the tinkering or have specific privacy goals.' },
        ],
      },
      {
        title: 'Create your NextDNS profile',
        time: '5 min',
        blocks: [
          { type: 'ol', items: [
            'Sign up at nextdns.io and create a new configuration.',
            'Under Privacy → enable "NextDNS Ads & Trackers Blocklist".',
            'Under Security → enable Threat Intelligence Feeds, AI-Driven Threat Detection, and DNS Rebinding protection.',
            'Under Parental Control → optional filters.',
            'Note your config ID (a 6-character hex string).',
          ] },
        ],
      },
      {
        title: 'Point your router at it',
        time: '8 min',
        blocks: [
          { type: 'p', text: 'This protects every device on your network without per-device setup. In your router admin panel:' },
          { type: 'ol', items: [
            'Find DHCP / DNS settings.',
            'Set primary DNS to the NextDNS endpoint shown in your dashboard.',
            'Set secondary to the same.',
            'Restart router.',
            'Confirm requests are flowing in your NextDNS dashboard.',
          ] },
          { type: 'callout', kind: 'tip', text: 'Your ISP may overwrite DNS settings on some routers. If so, configure DNS per device (iOS/Android both support DoH profiles) and use NextDNS apps on laptops.' },
        ],
      },
      {
        title: 'Enable DNS-over-HTTPS for mobile',
        time: '5 min',
        blocks: [
          { type: 'ol', items: [
            'iOS: install the NextDNS profile from your dashboard → Settings → installed profiles → activate.',
            'Android: NextDNS app handles it, or use Private DNS in system settings with your config ID hostname.',
          ] },
        ],
      },
      {
        title: 'Tune your blocklists',
        time: '8 min',
        blocks: [
          { type: 'p', text: 'Too aggressive and you\'ll break sites. Start with these and add more cautiously:' },
          { type: 'ul', items: [
            'OISD Big — high-quality ad/tracker list, low false positives',
            'Steven Black\'s Unified Hosts — well-maintained, frequent updates',
            'Energized Spark — light, good starter list',
          ] },
          { type: 'callout', kind: 'warn', text: 'Avoid stacking 10+ overlapping lists. You\'ll break login flows and waste DNS lookup time.' },
        ],
      },
      {
        title: 'Whitelist when something breaks',
        time: '6 min',
        blocks: [
          { type: 'p', text: 'When a site misbehaves:' },
          { type: 'ol', items: [
            'Open NextDNS dashboard → Logs → filter by domain.',
            'Find the blocked domain triggering the issue.',
            'Add to Allowlist with a note explaining why.',
            'Reload the page.',
          ] },
        ],
      },
    ],
    relatedSlugs: ['browser-privacy-speed', 'secure-secrets-modern-apps'],
  },

  /* ─────────────── 8. ACCOUNT RECOVERY (advanced) ─────────────── */
  {
    slug: 'email-account-hacked-runbook',
    level: 'advanced',
    icon: '🔓',
    cover: 'rose',
    tag: 'Recovery',
    tagClass: 'rose',
    title: 'What to Do If Your Email Account Is Hacked',
    desc: 'A 60-minute emergency runbook to regain access and contain the damage.',
    meta: '25 min · Advanced',
    readTime: 25,
    publishedAt: '2026-05-15',
    author: { name: 'Aanya Sharma', role: 'Incident Response Coach' },
    learnings: [
      'Triage steps for the first 5 minutes',
      'How to lock the attacker out for good',
      'Which downstream accounts to check (and in what order)',
    ],
    prerequisites: [
      'Calm. You can do this.',
      'A second device (phone if your laptop is compromised, or vice versa)',
    ],
    steps: [
      {
        title: 'First 5 minutes — contain',
        time: '5 min',
        blocks: [
          { type: 'callout', kind: 'warn', title: 'Don\'t panic', text: "Most account compromises can be undone within an hour if you act methodically. Breathe, then start the runbook." },
          { type: 'ol', items: [
            'Get to a known-clean device. Don\'t use the same machine if you suspect malware.',
            'Open your email provider\'s recovery page (gmail.com/recover, account.live.com/password/reset).',
            'Attempt password reset using your verified phone/recovery email.',
          ] },
        ],
      },
      {
        title: 'Reclaim the account',
        time: '15 min',
        blocks: [
          { type: 'ol', items: [
            'Successfully log in → immediately change password to something the attacker can\'t guess.',
            'Force log-out of all sessions (Gmail: "Sign out all other web sessions"; Outlook: equivalent setting).',
            'Revoke any 3rd-party app access you don\'t recognise.',
            'Re-enable 2FA. If it was disabled, the attacker did it — re-enable with an authenticator app.',
            'Update recovery email/phone if the attacker changed them.',
          ] },
        ],
      },
      {
        title: 'Find out what they did',
        time: '10 min',
        blocks: [
          { type: 'ul', items: [
            'Check Sent folder, Drafts, and Trash for messages you didn\'t send.',
            'Look for forwarding rules — attackers often forward your mail to themselves.',
            'Check filters that auto-delete bank/security notifications.',
            'Review login activity (location, device, IP).',
          ] },
        ],
      },
      {
        title: 'Lockdown downstream accounts',
        time: '20 min',
        blocks: [
          { type: 'p', text: 'Your email is the master key. Change passwords on these in order:' },
          { type: 'ol', items: [
            'Banking + payment apps (PayPal, Venmo, brokerage)',
            'Password manager master password',
            'Major social: Facebook, Instagram, X, LinkedIn',
            'Shopping accounts with stored cards (Amazon)',
            'Work/SaaS accounts (Slack, Notion, Google Workspace)',
          ] },
        ],
      },
      {
        title: 'Notify and document',
        time: '10 min',
        blocks: [
          { type: 'ul', items: [
            'Notify friends/family — attackers often impersonate you to scam them.',
            'Report to your email provider via their abuse channel.',
            'Save screenshots of suspicious activity (you may need them for fraud disputes).',
            'File a police report if money was moved.',
          ] },
        ],
      },
      {
        title: 'Post-mortem',
        time: '5 min',
        blocks: [
          { type: 'p', text: 'After the dust settles, figure out the entry vector:' },
          { type: 'ul', items: [
            'Run our Email Breach Checker — was your email in a recent leak?',
            'Was your password reused on a hacked site?',
            'Did you click a phishing link recently?',
            'Was malware on your machine? Run a full scan.',
          ] },
        ],
      },
    ],
    relatedSlugs: ['strong-password-passphrase', 'enable-2fa-everywhere'],
  },

  /* ─────────────── 9. SECRETS (developer / advanced) ─────────────── */
  {
    slug: 'secure-secrets-modern-apps',
    level: 'advanced',
    icon: '👨‍💻',
    cover: 'purple',
    tag: 'Developer',
    tagClass: 'purple',
    title: 'Storing Secrets Securely in Modern Apps',
    desc: 'Environment variables, secret managers, and rotating keys — done the right way.',
    meta: '30 min · Advanced',
    readTime: 30,
    publishedAt: '2026-05-18',
    author: { name: 'Diego Martín', role: 'Platform Security Engineer' },
    learnings: [
      'Why .env files leak — and how to make them safer',
      'When to switch to a secret manager',
      'How to rotate keys without downtime',
    ],
    prerequisites: [
      'Comfort with the command line',
      'A project with at least one API key',
    ],
    steps: [
      {
        title: "Stop committing .env files",
        time: '3 min',
        blocks: [
          { type: 'p', text: 'The #1 source of leaked production keys is a .env accidentally pushed to GitHub.' },
          { type: 'code', language: 'bash', text: 'echo ".env\\n.env.*\\n!.env.example" >> .gitignore\ngit rm --cached .env  # if it\'s already tracked' },
          { type: 'callout', kind: 'warn', text: 'Already pushed one? Rotate every key immediately — assume it\'s in scrapers within minutes. Then git filter-repo to scrub history.' },
        ],
      },
      {
        title: 'Use .env.example as documentation',
        time: '2 min',
        blocks: [
          { type: 'p', text: 'Check in a non-secret template so teammates know which env vars to set:' },
          { type: 'code', language: 'bash', text: '# .env.example\nDATABASE_URL=postgres://user:pass@localhost:5432/db\nSTRIPE_SECRET_KEY=sk_test_...\nJWT_SECRET=at-least-32-random-chars' },
        ],
      },
      {
        title: 'Upgrade to a secret manager',
        time: '10 min',
        blocks: [
          { type: 'p', text: 'For anything beyond a side project, store secrets in a dedicated manager:' },
          { type: 'ul', items: [
            'Vercel / Netlify environment variables (frontend deploys)',
            'AWS Secrets Manager / SSM Parameter Store',
            'Doppler — friendliest dev UX',
            'HashiCorp Vault — enterprise-grade',
            'GCP Secret Manager / Azure Key Vault',
          ] },
        ],
      },
      {
        title: 'Inject secrets at runtime, not build time',
        time: '5 min',
        blocks: [
          { type: 'p', text: 'Baking secrets into a Docker image means they\'re visible to anyone with image access. Read them from the secret manager at process start instead:' },
          { type: 'code', language: 'javascript', text: "import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'\n\nconst client = new SecretsManagerClient({ region: 'us-east-1' })\nconst { SecretString } = await client.send(\n  new GetSecretValueCommand({ SecretId: 'prod/stripe' })\n)\nprocess.env.STRIPE_SECRET_KEY = JSON.parse(SecretString).key" },
        ],
      },
      {
        title: 'Rotate keys on a schedule',
        time: '6 min',
        blocks: [
          { type: 'p', text: 'Even uncompromised keys should rotate periodically:' },
          { type: 'ul', items: [
            'Database credentials — every 90 days',
            'Third-party API keys (Stripe, SendGrid) — every 6 months',
            'JWT signing secrets — every 12 months with overlap windows',
            'Anything that touched a leaked dependency — immediately',
          ] },
          { type: 'callout', kind: 'tip', title: 'Zero-downtime rotation', text: 'Provision the new key alongside the old, deploy code that reads the new one, verify, then delete the old. Never delete first.' },
        ],
      },
      {
        title: 'Scan and audit',
        time: '4 min',
        blocks: [
          { type: 'p', text: 'Add automated tooling:' },
          { type: 'ul', items: [
            'GitHub Secret Scanning — free for public repos',
            'TruffleHog / Gitleaks — pre-commit hook + CI',
            'Dependabot — alerts on vulnerable dependencies that may exfiltrate secrets',
          ] },
        ],
      },
    ],
    relatedSlugs: ['dns-level-ad-blocking', 'email-account-hacked-runbook'],
  },
]

/* helpers */
export function getGuideBySlug(slug) {
  return GUIDES.find((g) => g.slug === slug)
}

export function getRelatedGuides(slug) {
  const g = getGuideBySlug(slug)
  if (!g) return []
  return (g.relatedSlugs || [])
    .map(getGuideBySlug)
    .filter(Boolean)
}
