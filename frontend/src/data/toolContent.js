/* ===================================================================
   Single source of truth for editable tool content.
   - Each tool imports its DEFAULTS from here.
   - The Set-Content admin page edits Redux overrides that take priority.
   - Patterns that contain regex are SERIALISED for storage / editing
     via the helper functions at the bottom of this file.
   =================================================================== */

/* ===================================================================
   1. ACCOUNT SECURITY SCORE
   =================================================================== */

export const ACCOUNT_BASIC_DEFAULT = [
  {
    id: 'passwords',
    icon: '🔑',
    title: 'Passwords',
    desc: 'How you create and store the keys to your accounts.',
    questions: [
      { id: 'q-pw-manager', text: 'Do you use a password manager?',
        options: [
          { id: 'yes',  label: 'Yes, for everything',     score: 10 },
          { id: 'some', label: 'For some accounts only',  score: 6 },
          { id: 'no',   label: 'No — I remember/reuse',   score: 0 },
        ] },
      { id: 'q-pw-unique', text: 'Are your passwords unique per site?',
        options: [
          { id: 'all',  label: 'Yes, every site is unique',   score: 10 },
          { id: 'most', label: 'Most are, a few repeats',     score: 6 },
          { id: 'few',  label: 'Same password on many sites', score: 0 },
        ] },
      { id: 'q-pw-length', text: 'How long are your passwords (on average)?',
        options: [
          { id: '16',  label: '16+ characters',     score: 10 },
          { id: '12',  label: '12–15 characters',   score: 7 },
          { id: '8',   label: '8–11 characters',    score: 3 },
          { id: 'lt8', label: 'Under 8 characters', score: 0 },
        ] },
    ],
  },
  {
    id: 'twofa', icon: '🛡️', title: 'Two-Factor Authentication',
    desc: 'Your second line of defence after the password.',
    questions: [
      { id: 'q-2fa-email', text: 'Is 2FA enabled on your email account?',
        options: [
          { id: 'app', label: 'Yes, with an authenticator app', score: 10 },
          { id: 'sms', label: 'Yes, with SMS',                  score: 6 },
          { id: 'no',  label: 'No 2FA on email',                score: 0 },
        ] },
      { id: 'q-2fa-bank', text: 'Is 2FA enabled on banking / payment apps?',
        options: [
          { id: 'yes',  label: "Yes, everywhere it's offered", score: 10 },
          { id: 'some', label: 'Some, not all',                score: 5 },
          { id: 'no',   label: 'No',                           score: 0 },
        ] },
      { id: 'q-2fa-social', text: 'Is 2FA enabled on social media?',
        options: [
          { id: 'yes',  label: 'Yes on all main accounts', score: 10 },
          { id: 'some', label: 'On one or two',            score: 5 },
          { id: 'no',   label: 'Not yet',                  score: 0 },
        ] },
    ],
  },
  {
    id: 'recovery', icon: '🗝️', title: 'Recovery & Backup',
    desc: 'How quickly you can get back in if something goes wrong.',
    questions: [
      { id: 'q-rec-codes', text: 'Have you saved your 2FA backup codes?',
        options: [
          { id: 'yes',  label: 'Yes, in a secure place',                   score: 10 },
          { id: 'note', label: 'Saved in notes / cloud',                   score: 5 },
          { id: 'no',   label: "No / I don't know what those are",         score: 0 },
        ] },
      { id: 'q-rec-email', text: 'Is your account recovery email up-to-date?',
        options: [
          { id: 'yes', label: 'Yes, and I check it',               score: 10 },
          { id: 'old', label: "It's an old address I rarely use",  score: 4 },
          { id: 'no',  label: "I haven't reviewed it",             score: 0 },
        ] },
    ],
  },
  {
    id: 'devices', icon: '💻', title: 'Device Security',
    desc: 'The phone and laptop that hold your sessions.',
    questions: [
      { id: 'q-dev-lock', text: 'How does your phone unlock?',
        options: [
          { id: 'long',  label: '6+ digits or alphanumeric + biometric', score: 10 },
          { id: 'four',  label: '4-digit PIN',                            score: 5 },
          { id: 'swipe', label: 'Swipe / no lock',                        score: 0 },
        ] },
      { id: 'q-dev-updates', text: 'Do you install OS / app updates promptly?',
        options: [
          { id: 'auto',   label: 'Auto-updates on',         score: 10 },
          { id: 'weekly', label: 'Within a week',           score: 7 },
          { id: 'lazy',   label: 'I delay them for months', score: 0 },
        ] },
      { id: 'q-dev-encrypt', text: "Is your laptop's disk encryption on?",
        options: [
          { id: 'yes', label: 'Yes (FileVault / BitLocker / LUKS)', score: 10 },
          { id: 'idk', label: "I'm not sure",                       score: 4 },
          { id: 'no',  label: 'No',                                 score: 0 },
        ] },
    ],
  },
  {
    id: 'behavior', icon: '🧠', title: 'Browsing Habits',
    desc: 'The day-to-day choices that determine your real-world risk.',
    questions: [
      { id: 'q-bh-links', text: 'Do you verify URLs before clicking from email?',
        options: [
          { id: 'always', label: 'Always — I hover and read', score: 10 },
          { id: 'mostly', label: 'Usually',                   score: 7 },
          { id: 'rare',   label: 'Rarely — I just click',     score: 0 },
        ] },
      { id: 'q-bh-public', text: 'On public WiFi, do you use a VPN?',
        options: [
          { id: 'yes',  label: 'Yes, always',         score: 10 },
          { id: 'some', label: 'For banking only',    score: 6 },
          { id: 'no',   label: "I don't use a VPN",   score: 0 },
        ] },
      { id: 'q-bh-share', text: 'Do you share OTPs or codes when asked over phone?',
        options: [
          { id: 'never',   label: "Never — they're for me only",   score: 10 },
          { id: 'depends', label: 'Sometimes for delivery agents', score: 3 },
          { id: 'yes',     label: 'I share if asked nicely',       score: 0 },
        ] },
    ],
  },
]

export const ACCOUNT_ADVANCED_DEFAULT = [
  {
    id: 'privacy', icon: '🕵️', title: 'Privacy & Tracking',
    desc: 'How much you bleed to ad networks every time you browse.',
    questions: [
      { id: 'q-pr-blocker', text: 'Do you use a tracker / ad blocker?',
        options: [
          { id: 'ubo',  label: 'uBlock Origin or similar, always on', score: 10 },
          { id: 'lite', label: 'A light one (built into browser)',    score: 6 },
          { id: 'no',   label: 'No blocker',                          score: 0 },
        ] },
      { id: 'q-pr-permissions', text: 'When did you last review app permissions on your phone?',
        options: [
          { id: '6mo',   label: 'In the last 6 months', score: 10 },
          { id: 'year',  label: 'About a year ago',     score: 5 },
          { id: 'never', label: 'Never',                score: 0 },
        ] },
      { id: 'q-pr-search', text: "What's your default search engine?",
        options: [
          { id: 'priv',   label: 'DuckDuckGo / Brave Search / Startpage', score: 10 },
          { id: 'google', label: 'Google / Bing',                         score: 5 },
          { id: 'idk',    label: 'Whatever ships with the browser',       score: 4 },
        ] },
    ],
  },
  {
    id: 'mobile', icon: '📱', title: 'Mobile Security',
    desc: 'Your phone is the master key to almost everything.',
    questions: [
      { id: 'q-mob-source', text: 'Where do you install apps from?',
        options: [
          { id: 'store',  label: 'Official store only',                 score: 10 },
          { id: 'mostly', label: 'Mostly store, occasionally sideload', score: 4 },
          { id: 'side',   label: 'I sideload APKs / unsigned IPAs',     score: 0 },
        ] },
      { id: 'q-mob-notify', text: 'Do sensitive notifications (banking, OTP) preview on lock screen?',
        options: [
          { id: 'hidden',  label: 'Hidden — I have to unlock to read', score: 10 },
          { id: 'partial', label: 'Some hidden, others visible',       score: 6 },
          { id: 'all',     label: 'All previews visible',              score: 0 },
        ] },
      { id: 'q-mob-find', text: 'Is "Find My Phone" / remote wipe enabled?',
        options: [
          { id: 'yes', label: "Yes, and I've tested it", score: 10 },
          { id: 'on',  label: 'Enabled but never tested', score: 7 },
          { id: 'no',  label: 'No',                      score: 0 },
        ] },
    ],
  },
  {
    id: 'email', icon: '📧', title: 'Email Hygiene',
    desc: 'Your inbox is the password-reset gateway for every account.',
    questions: [
      { id: 'q-em-aliases', text: 'Do you use email aliases / "+tags" for signups?',
        options: [
          { id: 'always', label: 'Always — unique per service', score: 10 },
          { id: 'somet',  label: 'For high-value sites',        score: 6 },
          { id: 'never',  label: 'One email everywhere',        score: 0 },
        ] },
      { id: 'q-em-fwd', text: 'Have you checked your inbox for sneaky forwarding rules?',
        options: [
          { id: 'recent', label: 'Yes, recently',  score: 10 },
          { id: 'once',   label: 'Once, long ago', score: 5 },
          { id: 'never',  label: 'Never thought to', score: 0 },
        ] },
      { id: 'q-em-breach', text: 'Do you check breach-monitor services for your email?',
        options: [
          { id: 'sub',   label: 'Subscribed to alerts',  score: 10 },
          { id: 'occas', label: 'I check occasionally',  score: 6 },
          { id: 'never', label: 'Never',                 score: 0 },
        ] },
    ],
  },
  {
    id: 'backup', icon: '💾', title: 'Backup & Recovery',
    desc: 'Without backups, ransomware = total loss.',
    questions: [
      { id: 'q-bk-strategy', text: 'How are your important files backed up?',
        options: [
          { id: '321',   label: '3-2-1 (3 copies, 2 media, 1 off-site)', score: 10 },
          { id: 'cloud', label: 'One cloud service',                     score: 6 },
          { id: 'usb',   label: 'External drive once in a while',        score: 4 },
          { id: 'none',  label: 'No real backup',                        score: 0 },
        ] },
      { id: 'q-bk-test', text: 'When did you last *restore* from a backup to test it?',
        options: [
          { id: 'year',  label: 'Within the last year', score: 10 },
          { id: 'old',   label: 'Years ago',            score: 4 },
          { id: 'never', label: 'Never',                score: 0 },
        ] },
      { id: 'q-bk-enc', text: 'Are your backups encrypted?',
        options: [
          { id: 'yes', label: 'Yes — with my own key', score: 10 },
          { id: 'idk', label: 'Not sure',              score: 4 },
          { id: 'no',  label: 'Plain unencrypted',     score: 0 },
        ] },
    ],
  },
  {
    id: 'social-eng', icon: '🎭', title: 'Social Engineering Awareness',
    desc: 'The human attack surface — the hardest one to patch.',
    questions: [
      { id: 'q-se-call', text: 'A "bank rep" calls about suspicious activity. You…',
        options: [
          { id: 'hangup', label: 'Hang up and call the number on my card', score: 10 },
          { id: 'verify', label: 'Ask probing questions, share little',    score: 6 },
          { id: 'comply', label: 'Cooperate — they sound official',        score: 0 },
        ] },
      { id: 'q-se-travel', text: 'When you travel, do you post about it in real-time?',
        options: [
          { id: 'after',  label: "Only after I'm home",        score: 10 },
          { id: 'closed', label: 'Only on close-friends lists', score: 7 },
          { id: 'live',   label: 'Live updates publicly',       score: 0 },
        ] },
      { id: 'q-se-data', text: 'How much personal info is public on social profiles?',
        options: [
          { id: 'min',  label: 'Bare minimum — no DOB, address, employer', score: 10 },
          { id: 'some', label: 'Some — but no SSN-style info',             score: 6 },
          { id: 'all',  label: 'My full bio is out there',                 score: 0 },
        ] },
    ],
  },
]

export const ACCOUNT_RECOMMENDATIONS_DEFAULT = {
  passwords:    { icon: '🔑', title: 'Adopt a password manager', desc: 'Bitwarden, 1Password, or Proton Pass make per-site passwords effortless. The hardest part is starting.' },
  twofa:        { icon: '🛡️', title: 'Enable 2FA on email and finance first', desc: 'Even if a password leaks, an authenticator-app code stops 99% of remote takeovers. Email is the master key.' },
  recovery:     { icon: '🗝️', title: 'Print or vault your backup codes', desc: 'Without backup codes, losing your phone = losing your accounts. Store them in your password manager or a fire-safe drawer.' },
  devices:      { icon: '💻', title: 'Turn on auto-updates and disk encryption', desc: 'Outdated software is the #1 entry point for malware. FileVault/BitLocker stop a stolen laptop being a data breach.' },
  behavior:     { icon: '🧠', title: 'Read URLs right-to-left, every time', desc: 'A 2-second habit that defeats most phishing. The real domain is the part immediately before the first single slash.' },
  privacy:      { icon: '🕵️', title: 'Install uBlock Origin', desc: 'Free, open-source, and blocks 95%+ of trackers and ads. Pair with Firefox or Brave for the strongest default privacy.' },
  mobile:       { icon: '📱', title: 'Lock down lock-screen previews', desc: "Hide notification content for messaging, banking and email apps so a shoulder-surfer can't see your codes." },
  email:        { icon: '📧', title: 'Audit forwarding rules + use aliases', desc: 'Attackers love silent forwarding rules. Check Gmail/Outlook settings monthly. Use SimpleLogin or Apple Hide-My-Email for new signups.' },
  backup:       { icon: '💾', title: 'Adopt a 3-2-1 backup strategy', desc: '3 copies, 2 different media, 1 off-site. Encrypted. Backups are the only thing that beats ransomware.' },
  'social-eng': { icon: '🎭', title: 'Always verify out-of-band', desc: 'If anyone — bank, courier, IT, family — asks for codes or money via call or message, hang up and call back on a known number.' },
}

/* ===================================================================
   2. WIFI SAFETY CHECKER
   =================================================================== */

export const WIFI_NETWORK_TYPES_DEFAULT = [
  { id: 'home',    icon: '🏠', label: 'Home WiFi',      desc: 'Your own router at home.' },
  { id: 'public',  icon: '☕', label: 'Public / Café',  desc: 'Coffee shop, airport, hotel, library.' },
  { id: 'work',    icon: '🏢', label: 'Office',         desc: 'Workplace or corporate WiFi.' },
  { id: 'hotspot', icon: '📱', label: 'Mobile Hotspot', desc: 'Tethered from your phone.' },
]

export const WIFI_QUESTIONS_DEFAULT = {
  home: [
    { id: 'encryption', q: 'What encryption does your WiFi use?',
      opts: [
        { id: 'wpa3', label: 'WPA3',                       score: 10 },
        { id: 'wpa2', label: 'WPA2',                       score: 8 },
        { id: 'wpa',  label: 'WPA (old)',                  score: 3 },
        { id: 'wep',  label: 'WEP',                        score: 0 },
        { id: 'open', label: 'No password (open)',         score: 0 },
        { id: 'idk',  label: "I don't know",               score: 2 },
      ] },
    { id: 'router-pw', q: 'Did you change the default router admin password?',
      opts: [
        { id: 'yes', label: 'Yes — strong, unique',  score: 10 },
        { id: 'idk', label: 'I think so',            score: 5 },
        { id: 'no',  label: 'Still on the sticker',  score: 0 },
      ] },
    { id: 'firmware', q: 'When did you last update router firmware?',
      opts: [
        { id: 'recent', label: 'In the last 3 months',          score: 10 },
        { id: 'year',   label: 'Within the last year',          score: 6 },
        { id: 'old',    label: 'Over a year ago',               score: 2 },
        { id: 'never',  label: "Never / I don't know how",      score: 0 },
      ] },
    { id: 'guest', q: 'Do you have a separate guest network?',
      opts: [
        { id: 'yes',  label: 'Yes, isolated from my devices', score: 10 },
        { id: 'wifi', label: 'Just one WiFi for everyone',    score: 4 },
        { id: 'no',   label: 'No guest network',              score: 4 },
      ] },
    { id: 'iot', q: 'IoT devices (cameras, smart bulbs) on the main network?',
      opts: [
        { id: 'sep',  label: "No — they're on a guest/IoT VLAN", score: 10 },
        { id: 'main', label: 'Yes, all on the main network',     score: 3 },
        { id: 'none', label: "I don't use IoT devices",          score: 10 },
      ] },
    { id: 'wps', q: 'Is WPS (push-button pairing) enabled?',
      opts: [
        { id: 'no',  label: 'Disabled',  score: 10 },
        { id: 'yes', label: 'Enabled',   score: 3 },
        { id: 'idk', label: 'Not sure',  score: 5 },
      ] },
    { id: 'remote-mgmt', q: 'Is remote admin (managing the router from outside) on?',
      opts: [
        { id: 'no',  label: 'Disabled', score: 10 },
        { id: 'yes', label: 'Enabled',  score: 0 },
        { id: 'idk', label: 'Not sure', score: 5 },
      ] },
  ],
  public: [
    { id: 'name', q: 'How did you verify the network name?',
      opts: [
        { id: 'asked', label: 'Asked staff for the official name', score: 10 },
        { id: 'sign',  label: 'Saw it on a sign or menu',          score: 8 },
        { id: 'guess', label: 'Picked the strongest "free" SSID',  score: 0 },
      ] },
    { id: 'portal', q: 'Did it require a captive portal sign-in?',
      opts: [
        { id: 'email-only', label: 'Just an email — no account',  score: 7 },
        { id: 'voucher',    label: 'Voucher / room key',          score: 9 },
        { id: 'social',     label: 'Sign in with Facebook/Google', score: 4 },
        { id: 'none',       label: 'Open, no login at all',       score: 3 },
      ] },
    { id: 'vpn', q: 'Are you using a VPN right now?',
      opts: [
        { id: 'yes',       label: 'Yes, always',         score: 10 },
        { id: 'sometimes', label: 'For banking only',    score: 5 },
        { id: 'no',        label: 'No VPN',              score: 0 },
      ] },
    { id: 'banking', q: 'Have you logged into banking on this network?',
      opts: [
        { id: 'no',      label: "No, I wait until I'm home", score: 10 },
        { id: 'vpn',     label: 'Only over VPN',             score: 8 },
        { id: 'app',     label: "Yes, in the bank's app",    score: 6 },
        { id: 'browser', label: 'Yes, in a browser',         score: 0 },
      ] },
    { id: 'sharing', q: 'Is file/printer sharing on your laptop disabled?',
      opts: [
        { id: 'yes', label: 'Yes — public network profile active', score: 10 },
        { id: 'idk', label: 'Not sure',                            score: 4 },
        { id: 'no',  label: 'No, default settings',                score: 0 },
      ] },
    { id: 'twin', q: 'Were there multiple networks with the same name?',
      opts: [
        { id: 'no',  label: 'No — just one',                score: 10 },
        { id: 'yes', label: 'Yes (possible "evil twin")',  score: 0 },
        { id: 'idk', label: "I didn't check",               score: 5 },
      ] },
  ],
  work: [
    { id: 'corp-only', q: 'Is the network managed by IT / corporate?',
      opts: [
        { id: 'yes',   label: 'Yes — joined via SSO / cert', score: 10 },
        { id: 'guest', label: "I'm on the guest network",    score: 6 },
        { id: 'no',    label: 'Personal router setup',       score: 3 },
      ] },
    { id: 'cert', q: 'Does the network use 802.1X / certificates?',
      opts: [
        { id: 'yes', label: 'Yes',                    score: 10 },
        { id: 'idk', label: 'Not sure',               score: 6 },
        { id: 'no',  label: 'Just a shared password', score: 4 },
      ] },
    { id: 'byod', q: 'Is your personal device on the same network as servers?',
      opts: [
        { id: 'no',  label: 'No — separate BYOD/guest network', score: 10 },
        { id: 'yes', label: 'Yes, all on one flat network',     score: 3 },
        { id: 'idk', label: 'Not sure',                         score: 5 },
      ] },
    { id: 'vpn', q: 'Do you use the corporate VPN when working remotely?',
      opts: [
        { id: 'always', label: 'Always',          score: 10 },
        { id: 'office', label: 'Only off-office', score: 8 },
        { id: 'never',  label: 'Never',           score: 0 },
      ] },
  ],
  hotspot: [
    { id: 'pw', q: 'Does the hotspot require a password?',
      opts: [
        { id: 'yes', label: 'Yes — WPA2/WPA3',  score: 10 },
        { id: 'no',  label: 'No password',      score: 0 },
        { id: 'pin', label: 'Just a short PIN', score: 5 },
      ] },
    { id: 'plan', q: 'Are you on a metered mobile data plan?',
      opts: [
        { id: 'unlim', label: 'Unlimited',             score: 10 },
        { id: 'big',   label: 'Big monthly allowance', score: 8 },
        { id: 'small', label: 'Small / metered',       score: 5 },
      ] },
    { id: 'shared', q: 'Who else is connected?',
      opts: [
        { id: 'me',     label: 'Just me',                       score: 10 },
        { id: 'family', label: 'My own devices',                score: 9 },
        { id: 'friend', label: 'A trusted friend',              score: 6 },
        { id: 'open',   label: 'Anyone who knows the password', score: 3 },
      ] },
  ],
}

export const WIFI_RECS_DEFAULT = {
  encryption:    { title: 'Upgrade to WPA3 (or at minimum WPA2-AES)', desc: 'WPA and WEP are crackable in minutes. Most routers from the last 5 years support WPA2; newer ones support WPA3.' },
  'router-pw':   { title: 'Change the default router admin password', desc: 'Default credentials are public knowledge and the #1 way home routers get hijacked. Use a long, unique password — store it in your password manager.' },
  firmware:      { title: 'Update your router firmware', desc: 'Outdated firmware leaves known vulnerabilities open. Enable auto-updates if your router supports it, or check the admin page monthly.' },
  guest:         { title: 'Set up a guest network', desc: 'Isolates visitors and IoT devices from your laptop, phone, and NAS. Most modern routers can do this in 2 minutes.' },
  iot:           { title: 'Move IoT devices to a separate network', desc: 'Smart bulbs, cameras and thermostats are often poorly patched. Putting them on a guest/IoT VLAN contains any breach.' },
  wps:           { title: 'Disable WPS', desc: 'The 8-digit PIN can be brute-forced in hours. Pairing devices manually with the WiFi password is plenty fast enough.' },
  'remote-mgmt': { title: 'Disable remote management', desc: 'Almost no home user needs to manage their router from the public internet. Turn it off in the admin panel.' },
  name:          { title: 'Verify the network name with staff', desc: 'Attackers set up "Free Coffee_WiFi" lookalikes to steal credentials. Always confirm the exact SSID before joining.' },
  vpn:           { title: 'Use a VPN on untrusted networks', desc: 'A reputable VPN encrypts your traffic end-to-end so even a malicious AP sees nothing useful. Mullvad, ProtonVPN and IVPN are solid picks.' },
  banking:       { title: 'Avoid banking on public WiFi', desc: "If you must, use the bank's mobile app (certificate-pinned) over cellular data — not a browser on hotel WiFi." },
  sharing:       { title: 'Set the network profile to "Public"', desc: 'Windows and macOS automatically disable sharing and discoverability when the network type is set to Public.' },
  twin:          { title: 'Watch out for "evil twin" hotspots', desc: "When you see duplicate SSIDs, it's often an attacker. Forget the network and ask staff for the official one." },
  pw:            { title: 'Always password-protect your hotspot', desc: 'Open hotspots can be hijacked by anyone in range — even from across the street.' },
}

/* ===================================================================
   3. SOCIAL MEDIA PRIVACY CHECKER
   =================================================================== */

export const SOCIAL_PLATFORMS_DEFAULT = [
  {
    id: 'instagram', name: 'Instagram', icon: '📷',
    color: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    settingsUrl: 'https://www.instagram.com/accounts/privacy_and_security/',
    items: [
      { id: 'private',     label: 'Account is set to Private', detail: 'Only approved followers can see your posts and stories.' },
      { id: '2fa',         label: 'Two-factor authentication enabled' },
      { id: 'tags',        label: 'Tagging requires your approval before showing' },
      { id: 'mentions',    label: 'Mentions limited to followers / no one' },
      { id: 'activity',    label: 'Activity status hidden' },
      { id: 'story-share', label: 'Story sharing & reshare disabled' },
      { id: 'dm-others',   label: 'DM requests from non-followers go to filtered inbox' },
      { id: 'ads',         label: 'Personalised ads / data sharing turned off' },
      { id: 'login',       label: 'Logged in only on devices you recognise' },
    ],
  },
  {
    id: 'facebook', name: 'Facebook', icon: 'f',
    color: 'linear-gradient(135deg, #1877f2, #0866ff)',
    settingsUrl: 'https://www.facebook.com/settings?tab=privacy',
    items: [
      { id: 'audience',       label: 'Default post audience is Friends (not Public)' },
      { id: '2fa',            label: 'Two-factor authentication enabled' },
      { id: 'search-engines', label: "Search engines can't link to your profile" },
      { id: 'friend-req',     label: 'Friend requests restricted to friends-of-friends' },
      { id: 'tagging',        label: 'Profile + tagged-post review enabled' },
      { id: 'face',           label: 'Face-recognition disabled (where offered)' },
      { id: 'ads',            label: 'Ad personalisation & off-Facebook activity off' },
      { id: 'apps',           label: 'Old third-party app permissions revoked' },
      { id: 'past-posts',     label: 'Past public posts limited to Friends' },
    ],
  },
  {
    id: 'twitter', name: 'X (Twitter)', icon: '𝕏',
    color: 'linear-gradient(135deg, #000000, #1d1d1f)',
    settingsUrl: 'https://x.com/settings/privacy_and_safety',
    items: [
      { id: 'protected',      label: 'Posts are protected (private)', detail: 'Only your approved followers see your tweets.' },
      { id: '2fa',            label: 'Two-factor authentication enabled' },
      { id: 'discover-email', label: "People can't find you by email or phone" },
      { id: 'location',       label: 'Precise location off on tweets' },
      { id: 'dms-anyone',     label: 'DMs limited to followers (or off)' },
      { id: 'tagging',        label: 'Photo tagging from anyone disabled' },
      { id: 'ads',            label: 'Personalised ads / data sharing off' },
      { id: 'apps',           label: 'Stale OAuth app access revoked' },
    ],
  },
  {
    id: 'linkedin', name: 'LinkedIn', icon: 'in',
    color: 'linear-gradient(135deg, #0a66c2, #004182)',
    settingsUrl: 'https://www.linkedin.com/mypreferences/d/categories/privacy',
    items: [
      { id: '2fa',                label: 'Two-step verification enabled' },
      { id: 'profile-visibility', label: 'Profile viewing options set to anonymous' },
      { id: 'photo-visibility',   label: 'Profile photo visibility restricted appropriately' },
      { id: 'connection-list',    label: 'Connections list hidden from your network' },
      { id: 'search-engines',     label: 'Search engines blocked from indexing profile' },
      { id: 'discover-email',     label: "People can't find you via email/phone import" },
      { id: 'data-export',        label: 'Reviewed downloadable data export to know what they have' },
      { id: 'ads',                label: 'Targeted ad & cookie sharing settings reviewed' },
      { id: 'inmail',             label: 'InMail filtered or off' },
    ],
  },
  {
    id: 'tiktok', name: 'TikTok', icon: '♪',
    color: 'linear-gradient(135deg, #25f4ee, #fe2c55)',
    settingsUrl: 'https://www.tiktok.com/setting',
    items: [
      { id: 'private',  label: 'Account is Private' },
      { id: '2fa',      label: 'Two-factor authentication enabled' },
      { id: 'discover', label: 'Suggest your account to others is OFF' },
      { id: 'comments', label: 'Comments limited to friends or off' },
      { id: 'duet',     label: 'Duet & Stitch limited to followers or off' },
      { id: 'download', label: 'Video downloads disabled' },
      { id: 'dm',       label: 'DMs restricted to mutuals' },
      { id: 'ads',      label: 'Personalised ads / data sharing off' },
    ],
  },
  {
    id: 'whatsapp', name: 'WhatsApp', icon: '💬',
    color: 'linear-gradient(135deg, #25d366, #128c7e)',
    settingsUrl: 'https://faq.whatsapp.com/general/security-and-privacy',
    items: [
      { id: '2sv',           label: 'Two-step verification PIN enabled' },
      { id: 'profile-photo', label: 'Profile photo visible only to contacts' },
      { id: 'last-seen',     label: 'Last seen / online status restricted' },
      { id: 'about',         label: 'About text limited to contacts' },
      { id: 'groups',        label: '"Who can add you to groups" set to Contacts or My Contacts Except…' },
      { id: 'read',          label: 'Read receipts off (if you prefer)' },
      { id: 'screen-lock',   label: 'App screen-lock with biometric / PIN' },
      { id: 'disappearing',  label: 'Disappearing messages on for sensitive chats' },
      { id: 'backup',        label: 'End-to-end encrypted cloud backup enabled' },
    ],
  },
]

/* ===================================================================
   4. SCAM MESSAGE ANALYZER
   - Regex stored as STRING + FLAGS strings so they can be
     persisted, edited, and round-tripped.
   =================================================================== */

export const SCAM_PATTERNS_DEFAULT = [
  { id: 'urgency',       cat: 'Urgency',      severity: 'high', label: 'Urgency / fear-of-loss',
    pattern: '\\b(urgent|immediately|right now|act now|expires? (today|in \\d|in \\d+ hours?)|24[- ]?hours?|final notice|last chance|action required)\\b',
    flags: 'gi', why: 'Phishers create artificial time pressure so you click before thinking.' },
  { id: 'authority',     cat: 'Authority',    severity: 'high', label: 'Spoofed authority figure',
    pattern: '\\b(irs|fbi|police|government|tax (office|department)|customs|court|legal team|interpol|ato|hmrc)\\b',
    flags: 'gi', why: 'Real agencies almost never first-contact you via text or email demanding payment.' },
  { id: 'money',         cat: 'Money',        severity: 'high', label: 'Prize / payment lure',
    pattern: '\\b(won|winner|prize|lottery|inheritance|claim (your|the)|gift card|bitcoin|btc|crypto wallet|wire transfer|western union|moneygram|cashapp|venmo me|paypal me)\\b',
    flags: 'gi', why: 'Promises of free money — or requests to send money via untraceable channels — are textbook scams.' },
  { id: 'threats',       cat: 'Threats',      severity: 'high', label: 'Account suspension / threat',
    pattern: '\\b(suspended|deactivated|locked|will be closed|terminated|verify (your|now)|confirm your (identity|details)|unauthori[sz]ed (access|login))\\b',
    flags: 'gi', why: 'Threatening to lock your account is one of the top pretexts for credential phishing.' },
  { id: 'personal-info', cat: 'Data Request', severity: 'high', label: 'Personal info / OTP request',
    pattern: "\\b(ssn|social security|aadhaar|pan card|cvv|otp|one[- ]time (code|password)|pin|password|date of birth|mother'?s maiden name)\\b",
    flags: 'gi', why: 'No legitimate company will ever ask you for your OTP, password, or full SSN over message.' },
  { id: 'greeting',      cat: 'Pretext',      severity: 'med',  label: 'Generic greeting',
    pattern: '\\b(dear (customer|user|client|sir|madam|account holder|valued customer))\\b',
    flags: 'gi', why: 'Real companies usually address you by name. Generic greetings = mass blast.' },
  { id: 'short-url',     cat: 'URL',          severity: 'high', label: 'Shortened URL',
    pattern: '\\b(bit\\.ly|tinyurl\\.com|goo\\.gl|t\\.co|ow\\.ly|is\\.gd|buff\\.ly|cutt\\.ly|rebrand\\.ly|t\\.ly)\\/\\S+',
    flags: 'gi', why: 'Shortened URLs hide the destination — a favourite trick of smishing and phishing.' },
  { id: 'sus-tld',       cat: 'URL',          severity: 'med',  label: 'Suspicious top-level domain',
    pattern: '\\bhttps?:\\/\\/[^\\s]*\\.(ru|tk|xyz|top|cn|click|loan|gq|cf|zip|mov)(\\/|\\s|$)',
    flags: 'gi', why: "These TLDs are disproportionately used by phishing kits because they're cheap and lightly moderated." },
  { id: 'typosquat',     cat: 'URL',          severity: 'high', label: 'Lookalike brand domain',
    pattern: '\\b(paypa1|g00gle|amaz0n|micr0soft|app1e|faceb00k|netfllx|rnicrosoft|arnazon|0utlook|lnstagram|whatsap|wattsapp)\\b',
    flags: 'gi', why: 'Lookalike characters (1↔l, 0↔o, rn↔m) are how phishing kits impersonate big brands.' },
  { id: 'ip-url',        cat: 'URL',          severity: 'high', label: 'Raw IP address in URL',
    pattern: 'https?:\\/\\/(\\d{1,3}\\.){3}\\d{1,3}(\\/\\S*)?',
    flags: 'gi', why: 'Real services use domain names. An IP-only URL almost always points to a one-off attack server.' },
  { id: 'allcaps',       cat: 'Style',        severity: 'low',  label: 'Shouting (3+ ALL CAPS words)',
    pattern: '\\b([A-Z]{3,}\\s+){2,}[A-Z]{3,}\\b',
    flags: 'g', why: 'Excessive ALL CAPS is a classic emotional-manipulation tactic in scam messages.' },
  { id: 'punct',         cat: 'Style',        severity: 'low',  label: 'Excessive punctuation (!!! / ???)',
    pattern: '[!?]{3,}',
    flags: 'g', why: "Multiple !!! or ??? signal an inauthentic, panicked tone — real businesses don't write like that." },
  { id: 'big-money',     cat: 'Money',        severity: 'med',  label: 'Specific large dollar amount',
    pattern: '\\$\\s?\\d{2,}([,.]\\d+)?\\s*(million|m|k)?',
    flags: 'gi', why: 'Specific dollar amounts (especially round, large numbers) are bait — designed to grab attention.' },
  { id: 'reply-code',    cat: 'Action',       severity: 'high', label: '"Reply with code" or similar',
    pattern: '\\b(reply (with|to) (this|the) (code|otp|number)|share (the|your) code|forward this code|send (us|me) the (code|otp))\\b',
    flags: 'gi', why: 'A request to forward an OTP / 2FA code is a strong sign of an account-takeover attempt in progress.' },
]

export const SCAM_EXAMPLES_DEFAULT = {
  scam: `URGENT: Your bank account has been SUSPENDED!!! 
Dear Customer, we detected unauthorized access. Click here to verify your identity within 24 hours or your account will be permanently closed: http://bit.ly/secure-paypa1-verify
Reply with your OTP to confirm. — Customer Service`,
  legit: `Hi Sarah,
Just confirming your appointment on Tuesday at 3 PM. Reply YES to confirm or NO to reschedule.
— Dr. Patel's office, 555-0142`,
}

/* Hydrate the string patterns into RegExp at consumer-time.
   Falls back gracefully if a user supplies a malformed regex. */
export function hydrateScamPatterns(patterns) {
  return patterns
    .map((p) => {
      try {
        return { ...p, regex: new RegExp(p.pattern, p.flags || 'gi') }
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

/* ===================================================================
   5. PHISHING AWARENESS QUIZ
   =================================================================== */

export const PHISHING_QUESTIONS_DEFAULT = [
  {
    id: 'q1', type: 'email', isPhish: true,
    from: 'Apple Support <support@app1e-id.com>',
    subject: 'Your Apple ID has been locked',
    body: [
      'Dear Customer,',
      'We detected unusual sign-in activity. To prevent unauthorized access, your Apple ID has been temporarily locked.',
      'Please verify your identity within 24 hours or your account will be permanently disabled.',
      'Verify now: https://app1e-id.com/verify',
      'Apple Inc. — © 2024',
    ],
    why: 'The sender domain "app1e-id.com" uses a numeral "1" instead of the letter "l" — a classic typosquat. Apple never asks you to verify via a third-party domain.',
    redFlags: ['Lookalike sender domain', 'Urgency / 24-hour deadline', 'Generic greeting', 'Non-Apple verification URL'],
  },
  {
    id: 'q2', type: 'email', isPhish: false,
    from: 'GitHub <noreply@github.com>',
    subject: '[GitHub] A new SSH key was added to your account',
    body: [
      'Hi octocat,',
      'A new SSH key was added to your account: "MacBook-Pro" (SHA256:8j9k…)',
      'If you did not authorize this action, immediately revoke the key from your security settings: https://github.com/settings/keys',
      'If this was you, you can safely ignore this email.',
    ],
    why: 'Legitimate transactional email: addresses you by username, links to the real github.com domain, and gives a clear action without using fear tactics.',
    redFlags: [],
  },
  {
    id: 'q3', type: 'url', isPhish: true,
    url: 'https://amaz0n.com.secure-login.ru/signin?ref=order',
    why: 'The actual domain is "secure-login.ru", not amazon.com. Phishers often hide the real domain in front of subdomains. Always read URLs right-to-left.',
    redFlags: ['Real domain is .ru, not .com', 'Brand name in subdomain only', 'Numeric substitution (amaz0n)'],
  },
  {
    id: 'q4', type: 'url', isPhish: false,
    url: 'https://accounts.google.com/o/oauth2/auth?client_id=123&redirect_uri=…',
    why: "The domain is accounts.google.com — Google's legitimate OAuth host. Long query strings are normal for OAuth flows.",
    redFlags: [],
  },
  {
    id: 'q5', type: 'email', isPhish: true,
    from: 'HR Department <hr@payro11.benefits.co>',
    subject: 'URGENT: New 2024 W-2 form requires immediate action',
    body: [
      'Hello,',
      'Per IRS update, all employees must download and re-submit the attached W-2 form by end of day.',
      'Failure to comply will result in payroll suspension.',
      '[ Open attachment: W-2_Form_2024.docm ]',
      'Thank you,',
      'HR',
    ],
    why: 'Unfamiliar sender domain, extreme urgency, threats of consequence, and a .docm macro attachment — all hallmarks of an invoice/payroll phish.',
    redFlags: ['Unknown domain (payro11.benefits.co)', '.docm attachment can run macros', 'Threats and urgency', 'No personal greeting'],
  },
  {
    id: 'q6', type: 'email', isPhish: false,
    from: 'Slack <feedback@slack.com>',
    subject: 'Your weekly Slack digest',
    body: [
      'Hi Sarah,',
      'You missed 14 messages across 3 channels this week. Top channel: #engineering (8 messages).',
      'Catch up: https://yourcompany.slack.com',
      'You can change notification preferences in Slack settings.',
    ],
    why: 'A typical product digest from a known sender, links to your own workspace subdomain. No call-to-action that asks for credentials.',
    redFlags: [],
  },
  {
    id: 'q7', type: 'sms', isPhish: true,
    from: '+1 (415) 555-0100',
    body: ['USPS: Your package #US98231 is on hold due to incomplete address. Confirm details: https://bit.ly/uspsdelivery'],
    why: "USPS never texts you with shortened URLs. Smishing attacks exploit common delivery anxiety. Real tracking links use usps.com or your carrier's domain.",
    redFlags: ['Shortened URL hides destination', 'Unfamiliar sender number', 'Common smishing pretext (delivery)', 'No real tracking number format'],
  },
  {
    id: 'q8', type: 'url', isPhish: true,
    url: 'https://xn--pple-43d.com/account',
    why: 'This is a Punycode (IDN) attack — "xn--pple-43d.com" renders as "applé.com" in many browsers, looking nearly identical to apple.com. Hover and inspect the raw URL.',
    redFlags: ['Punycode (xn--) prefix', 'Imitates well-known brand', 'Generic /account path'],
  },
  {
    id: 'q9', type: 'email', isPhish: true,
    from: 'IT Helpdesk <admin@helpdesk-portal.com>',
    subject: 'Mailbox storage is 99% full — action required',
    body: [
      'Dear user,',
      'Your mailbox has exceeded the storage quota. To avoid losing emails, please re-validate your account.',
      'Re-validate here: https://helpdesk-portal.com/owa-login',
      'IT Department',
    ],
    why: 'Mailbox-quota phishing is one of the most common corporate phish patterns. The link goes to a third-party domain that mimics Outlook Web Access (OWA).',
    redFlags: ['Third-party domain mimicking IT', 'Generic "Dear user"', 'Quota / fear-of-loss pretext', 'OWA lookalike URL'],
  },
  {
    id: 'q10', type: 'email', isPhish: false,
    from: 'Stripe <receipts@stripe.com>',
    subject: 'Your receipt from Acme, Inc. #1234-5678',
    body: [
      'Amount paid: $29.00',
      'Date: May 12, 2026',
      'Payment method: Visa ending in 4242',
      'View receipt: https://invoice.stripe.com/i/acct_1234/test_abc',
      'Questions? Reply to this email or contact merchant.',
    ],
    why: 'Real Stripe receipt: comes from stripe.com, links to invoice.stripe.com, contains specific transactional detail (card last-4, amount, date). No credential request.',
    redFlags: [],
  },
]

export const PHISHING_TIERS_DEFAULT = [
  { min: 9, label: 'Phishing Expert', color: '#16a34a', desc: 'You spot threats most people miss. You could train your team.' },
  { min: 7, label: 'Defender',        color: '#22c55e', desc: 'Solid instincts. A few tricks slipped through — keep practicing.' },
  { min: 5, label: 'Aware',           color: '#f59e0b', desc: "You're catching the obvious stuff, but sophisticated phish would still get you. Review the misses." },
  { min: 3, label: 'At Risk',         color: '#f97316', desc: 'You missed several attacks that would compromise an account. Read our guides before clicking another link.' },
  { min: 0, label: 'Easy Target',     color: '#ef4444', desc: 'An attacker would have a field day. Take our phishing-awareness training — seriously.' },
]

/* ===================================================================
   Tool registry — used by the Set-Content admin page.
   =================================================================== */

export const TOOLS = [
  { id: 'accountScore',  label: 'Account Security Score', icon: '📊', path: '/tools/account-security-score' },
  { id: 'wifiSafety',    label: 'WiFi Safety Checker',    icon: '📶', path: '/tools/wifi-safety' },
  { id: 'socialPrivacy', label: 'Social Media Privacy',   icon: '🔐', path: '/tools/social-privacy' },
  { id: 'scamAnalyzer',  label: 'Scam Message Analyzer',  icon: '💬', path: '/tools/scam-analyzer' },
  { id: 'phishingQuiz',  label: 'Phishing Awareness Quiz', icon: '🎣', path: '/tools/phishing-quiz' },
]
