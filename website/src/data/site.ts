/**
 * Page copy. Feature facts trace back to docs/website/chat-knowledge.md (Josh's file, 23 Oct 2026)
 * and docs/website/website-pack.md (the builder's pack, 24 Oct 2026); section numbers below refer
 * to the knowledge file. Posture, prices and the trial follow Josh's instructions of 30 Oct 2026
 * (30-day free trial on every plan, $98 / $178 / $249, no tester wording), which supersede the
 * file's §0, §6, §9, §10 and §11 until he updates it.
 */

export const site = {
  name: 'Paint Trade HQ',
  // Builder's pack §2 — the app's own one-line feature list, good for a hero.
  oneLiner:
    'Fast, accurate estimating · Invoicing and a live project tracker that follow the quote · CRM and an AI assistant that learns your workflow · Product library, employee records and calendar',
  description:
    'Paint Trade HQ runs a painting business end to end: quotes clients sign online, live jobs, crew sign-in with GPS, daily reports, invoices and payments, employee records, a CRM, a calendar and Lucy, the AI assistant. Built in Melbourne. Priced in AUD, GST on top.',
  appUrl: 'https://painttradehq.co',
  signInUrl: 'https://painttradehq.co/admin/login',
  crewUrl: 'https://painttradehq.co/crew',
  termsUrl: 'https://painttradehq.co/terms',
  supportEmail: 'software@joshsano.com.au',
  copyright: '© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ',
  location: 'Melbourne, Victoria',
  // §0 "Today's status" — the one posture the whole site takes.
  // The one posture the whole site takes (Josh, 30 Oct 2026).
  status: {
    pill: '30-day free trial',
    line: 'Every plan comes with a 30-day free trial. No card needed.',
    cta: 'Start free trial',
    ctaHref: '/trial',
  },
  trialDays: 30,
};

/** PUBLIC_CHAT_ENABLED=0 at build time leaves the chat box off every page. */
export const chatEnabled = import.meta.env.PUBLIC_CHAT_ENABLED !== '0';

export const nav = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Story', href: '/story' },
  { label: 'Find a painter', href: '/painters' },
];

/** §6 — plans, AUD a month, ex-GST; 10% GST is added. */
export type Plan = {
  id: string;
  name: string;
  price: number;
  admins: number;
  employees: number;
  extraAdmin: number;
  extraEmployee: number;
  blurb: string;
  includes: string[];
  inherits?: string;
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 98,
    admins: 1,
    employees: 3,
    extraAdmin: 25,
    extraEmployee: 15,
    blurb: 'For a sole trader with a couple of hands.',
    includes: [
      'Dashboard',
      'Estimating and quoting with the full Library',
      'Invoicing and payments',
      'CRM, calendar and the Employees page',
      'Project management: live project page and project details',
    ],
  },
  {
    id: 'small-business',
    name: 'Small business',
    price: 178,
    admins: 2,
    employees: 5,
    extraAdmin: 25,
    extraEmployee: 15,
    blurb: 'For a crew with an office and a bit of admin.',
    inherits: 'Everything in Starter, plus',
    includes: [
      'Presentation pages on quotes',
      'Auto-invoicing from the payment schedule',
      'Lucy, the AI assistant',
      'SMS to clients through your own number',
      'Timesheets',
      'Business performance stats on the live project page',
      'AI summaries on project details and per client',
      'One hour of training for one person',
    ],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    admins: 3,
    employees: 15,
    extraAdmin: 42,
    extraEmployee: 25,
    blurb: 'For a bigger crew with HR to run.',
    inherits: 'Everything in Small business, plus',
    includes: [
      'Performance page: validations, coaching, score trends',
      'Training videos for the crew',
      'HR contracts with e-signing',
      'Daily reports from the crew',
      'Equipment register and requests',
      'One hour of training per person',
      'Free data migration from your old software',
    ],
  },
];

export const pricingNotes = [
  'Prices are AUD a month, ex-GST; 10% GST is added.',
  'Free trial: 30 days on any plan, no card needed. Then pick a plan, or walk away.',
  'Monthly only, no annual price yet. Cancel any time and keep access to the end of the paid month. Upgrades apply at once, pro-rated; downgrades at the end of the month.',
  'Seats: admins are the people on the Team admins list including the owner; employees are the people on the Employees page who have not been removed. Going over the included number adds a seat at the prices above, and the app asks before it adds one.',
  'Data migration from old software: free on Enterprise, quoted on the other two.',
];

/** Format AUD like the knowledge file does: $59 and $64.90. */
export const aud = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
export const incGst = (n: number) => Math.round(n * 1.1 * 100) / 100;

/** §4 — the modules, in the order a job runs. `plan` is the lowest plan that includes it (§6). */
export type Module = {
  id: string;
  name: string;
  plan: 'Starter' | 'Small business' | 'Enterprise';
  summary: string;
  points: string[];
  screen?: string; // slot id in screens.ts
  screen2?: string; // optional second screenshot
  clip?: string; // clip id in screens.ts
};

export const modules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    plan: 'Starter',
    summary: 'Today at a glance.',
    points: [
      'Cards for quotes out, jobs on and money owed.',
      "The day's strip of jobs and events, local weather for your business address, and a map of today's jobs.",
      "Lucy's morning brief: what's on today and who to chase, written from your own data (Small business and up).",
      'Recent activity and any one-time notices, such as a Terms update with its "I agree" button.',
    ],
    screen: 'dashboard',
    clip: 'signin-to-job-drawer',
  },
  {
    id: 'library',
    name: 'Library: your prices',
    plan: 'Starter',
    summary: 'Your own price list, used by every quote.',
    points: [
      'Items (walls, ceilings, doors, trims and so on) with a rate and the minutes it takes, plus an optional preparation note and cost.',
      'Tasks for repairs and extras. Products for paints and materials, with the supplier price and your price.',
      'Items carry a photo. Add to the Library straight from a quote when you type something new.',
      'Rates are entered ex-GST; quotes can show prices including GST.',
    ],
    screen: 'library',
  },
  {
    id: 'quotes',
    name: 'Estimates and quotes',
    plan: 'Starter',
    summary: 'From the client and address to a signed quote on their phone.',
    points: [
      'Start from the client and address (Australian address finder). Add areas: interior rooms from a picker, exterior as four faces.',
      'Add lines from the Library by category, repairs as sub-rows, custom lines, and optional lines the client can tick.',
      'Photos on areas with mark-up (arrows, circles, text). Product colours chosen on the quote flow through to the job.',
      'Quote set-up: your default terms, payment schedule (default 30% deposit, 40% progress, 30% final), warranty line, contract terms and one quote design with your logo and colours.',
      'Presentation pages: extra pages built from blocks, about your business, your team, past job photos, reviews and ratings from eleven review sites, guarantees (Small business and up).',
      'Review & Send: one signature from the owner, an email with the link, a PDF, and a checklist of anything outstanding.',
      "The client's link: they read the quote on their phone, pick optional lines, sign by drawing or typing and tick the agreement. Acceptance creates the deposit invoice and tells you.",
      'Variations: priced changes during the job, approved by the client on a link with a typed name.',
    ],
    screen: 'quote-builder',
    clip: 'new-quote-to-sent',
  },
  {
    id: 'projects',
    name: 'Projects: the live job',
    plan: 'Starter',
    summary: 'Every job in flight, and the detail behind each one.',
    points: [
      'Projects page: status, crew assigned, money so far.',
      'Project details: the accepted quote, crew assignment, products attached, a before-and-after photo portfolio, labour cost from the time clock, margin and close-out numbers, and the variations.',
      'An AI summary of where the job is (Small business and up).',
      'The completion report, sent to the client on a link with photos.',
      'Crew notes on the job are for the crew; private admin notes live on the quote.',
    ],
    screen: 'project-details',
    clip: 'project-to-completion-report',
  },
  {
    id: 'timesheets',
    name: 'Timesheets and the time clock',
    plan: 'Starter',
    summary: 'Sign in, sign out, pay week done.',
    points: [
      'Crew sign in and out on their phones. The app records GPS at those two moments, the address and the distance from the job site, and flags a sign-in outside the job\'s radius. No tracking in between.',
      'Operating hours: your start and end time and working days. Crew get a reminder in the crew app to sign in and out (phone notifications are coming); an auto sign-out time closes forgotten sessions.',
      'Timesheets page (Small business and up): a week grid per person, sessions in a drawer, overtime split by your thresholds (default 8 hours a day and 38 a week), lock a week, export the payroll CSV.',
      'Pay rates on each employee: hourly, daily and an overtime rate. One money rule everywhere, and the project\'s labour cost uses the same rule.',
    ],
    screen: 'timesheets',
    clip: 'timesheets-to-payroll-csv',
  },
  {
    id: 'daily-reports',
    name: 'Daily reports',
    plan: 'Enterprise',
    summary: 'What happened on site today, with photos.',
    points: [
      'Crew write a daily site report on the phone: what was done, photos, issues, materials used.',
      'You read them in a feed and reply in a feedback thread.',
      'The client-facing completion report draws on them.',
    ],
    screen: 'daily-report',
    clip: 'crew-clock-in-and-daily-report',
  },
  {
    id: 'invoices',
    name: 'Invoices and payments',
    plan: 'Starter',
    summary: 'Deposit, progress, final. Paid by bank transfer.',
    points: [
      'The deposit invoice is created when the quote is accepted; progress and final invoices follow the payment schedule or are made by hand. Stand-alone invoices and credit notes too.',
      'Auto-invoicing raises the scheduled invoices for you (Small business and up).',
      'Each invoice has a public page and a PDF with your bank details. Clients pay by bank transfer or any method you record: cash, card in person, cheque. Record the payment and the balance updates.',
      'Paint Trade HQ does not take card payments from your clients and never holds card details.',
      'Invoice set-up: numbering, terms line, footer text.',
    ],
    screen: 'client-invoice',
    clip: 'invoice-payment-to-client-page',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    plan: 'Starter',
    summary: 'Jobs, events and reminders in one place.',
    points: [
      'Events, jobs and reminders with colour categories.',
      'Reminders can be tied to a client, with Tomorrow and Mark done.',
      'Connect Google Calendar to see it alongside your jobs.',
    ],
    screen: 'calendar',
  },
  {
    id: 'employees',
    name: 'Employees and HR',
    plan: 'Starter',
    summary: 'Records, pay rates, contracts, performance, gear.',
    points: [
      "Employees page: each person's profile, documents (licences, IDs), pay rates, start and end, access to the crew app, an onboarding code or QR, and who is on which job.",
      'Contracts: your own employment-agreement templates (the app points you to the business.gov.au Employment Contract Tool and never supplies legal wording), a wizard that fills the fields, the crew member signs on the phone, you countersign, and the signed PDF is emailed to both and saved. Nothing signed is ever edited or deleted (Enterprise).',
      'Performance: validations and coaching notes, a score trend over time; the crew see their own (Enterprise).',
      "Equipment: the business's tools and gear, who has what, and requests from the crew (Enterprise).",
      'Training videos: your videos grouped for the crew; watched state is kept (Enterprise).',
      'Team events: a notice board for the crew.',
    ],
    screen: 'employees',
    screen2: 'contracts',
  },
  {
    id: 'crew-app',
    name: 'The crew app',
    plan: 'Starter',
    summary: 'What your employees see on their phones.',
    points: [
      "Their day's jobs with the address, the time clock, the daily report with photos, contracts to read and sign, equipment requests, training, their own validations and coaching, team events, notifications, a feedback form and their profile.",
      'No prices, no margins, no admin pages, no AI assistant.',
      'The time clock is on every plan. Daily reports, contracts, equipment, training and performance notes are on Enterprise; the Pricing page lists what each plan includes.',
      'What the crew can see is your choice in Settings › Crew app.',
      "It is a web app: add it to the phone's home screen. There is no App Store or Play Store app.",
    ],
    screen: 'crew-time-clock',
  },
  {
    id: 'crm',
    name: 'CRM: clients and leads',
    plan: 'Starter',
    summary: 'Every client, every lead, every message on one page.',
    points: [
      'Clients: quotes, invoices, jobs, reminders and message history on one page; a per-client AI summary (Small business and up).',
      'Leads: a pipeline from enquiry to quoted to won or lost. Leads are entered or arrive by email.',
      'Inbox: email in and out from your connected mailbox (Gmail, Microsoft 365 or IMAP) in the client\'s thread.',
      'SMS to clients through a connected number; STOP replies are honoured (Small business and up).',
      'Automations: follow-ups on quotes not yet accepted, payment reminders, review requests after a job with your Google review link.',
      'You send in your own name; the law on marketing messages is yours to follow.',
    ],
    screen: 'crm',
  },
  {
    id: 'lucy',
    name: 'Lucy, the AI assistant',
    plan: 'Small business',
    summary: 'Drafts, briefs and summaries from your own data.',
    points: [
      "Lucy knows which page you are on and answers from your workspace's data only, never another business's.",
      "She writes the morning brief, drafts client messages and quote text, summarises a client's history or a job, suggests prices from your Library, and keeps the reminders and ideas you dictate.",
      'Everything she writes is a draft for you to check. The AI audit log lists every AI call for your business.',
      'Lucy runs on Anthropic\'s Claude. Under Anthropic\'s commercial terms your data is not used to train models. The crew have no AI features.',
    ],
    screen: 'lucy',
    clip: 'lucy-client-to-morning-brief',
  },
  {
    id: 'files',
    name: 'Files and storage',
    plan: 'Starter',
    summary: 'Your files, in our cloud or your own Google Drive.',
    points: [
      'Job photos, PDFs and signed documents go to Paint Trade HQ cloud by default.',
      'Or connect your own Google Drive: a "Paint Trade HQ" folder, one sub-folder per job, created at the first upload. You keep the files if you ever leave.',
    ],
    screen: 'files',
  },
];

/** §9 — status today, said honestly. Shown on the pricing page and used by the chat box. */
/** §7 — your data, security and leaving. */
export const trust: { title: string; body: string }[] = [
  {
    title: 'Each business is isolated',
    body: 'Your workspace is separate from every other business, and that separation is tested automatically on every release.',
  },
  {
    title: 'You own your data',
    body: 'Export quotes, invoices, credit notes, reports and signed documents as PDF, and daily reports, timesheets and sign-in records as CSV. Ask for a full export any time.',
  },
  {
    title: 'Leaving is simple',
    body: 'Ask to close the account. Data is kept 30 days in case you change your mind, then deleted from live systems, with backups overwritten within a further 60 days.',
  },
  {
    title: 'Built with care',
    body: 'Passwords hashed, HTTPS everywhere, third-party tokens encrypted or revocable, and every signed-in device listed in Settings › Security.',
  },
  {
    title: 'No selling of data',
    body: 'We do not sell, trade or rent personal data. We disclose it only when the law requires. Third parties touch data only when you use them, such as the AI service or the calendar and storage you connect.',
  },
  {
    title: 'Clear terms',
    body: 'Terms of Service reviewed by a lawyer. Section 5 of the Terms covers personal data.',
  },
];

/** §11 — questions people ask, with the answers. */
export const faqs: { q: string; a: string }[] = [
  {
    q: 'Is there a free plan?',
    a: 'No. Three plans, from $98 + GST a month, and every plan starts with a 30-day free trial with no card.',
  },
  { q: 'Do I need a card to try it?', a: 'No.' },
  {
    q: 'Can my client pay by card on the invoice?',
    a: 'No. Clients pay you by bank transfer with the details printed on the invoice, or any way you record. The app never holds card details.',
  },
  {
    q: 'Does it do GST?',
    a: 'Yes. Rates are ex-GST; quotes and invoices show GST and can show prices including GST. Our own prices are ex-GST plus 10%.',
  },
  {
    q: 'Does it track my crew?',
    a: 'Only at the moments they sign in and sign out: location, address and distance from the job. Nothing in between.',
  },
  {
    q: 'Can the crew see prices?',
    a: 'No. The crew app shows jobs, the time clock, reports, contracts, training, equipment and their own performance notes.',
  },
  {
    q: 'Does the client need an account?',
    a: 'No. They get a link, read, tick and sign on their phone.',
  },
  {
    q: 'Is the signature legal?',
    a: 'The app records the signature, name, time and address. Whether it binds is between you and your client; the Terms say so, and we do not give legal advice.',
  },
  {
    q: 'Can I use my own contract wording?',
    a: 'Yes, you write your own templates; the app fills the fields and handles the e-signing. It never supplies legal wording.',
  },
  {
    q: 'Where are my photos stored?',
    a: "In Paint Trade HQ's cloud, or in your own Google Drive once connected, in a \"Paint Trade HQ\" folder, one sub-folder per job.",
  },
  {
    q: 'Does it connect to Xero or MYOB?',
    a: 'Xero is on the list and not connected yet. No MYOB.',
  },
  {
    q: 'Is there an app for my phone?',
    a: 'The crew app and the client pages are web pages that work on any phone; add them to the home screen. No App Store app.',
  },
  {
    q: 'What does Lucy do?',
    a: 'Writes your morning brief, drafts messages and quote text, summarises clients and jobs, suggests prices from your Library. She only sees your own data and never trains anyone\'s model.',
  },
  {
    q: 'How many people can use it?',
    a: 'Starter one admin and three employees, Small business two and five, Enterprise three and fifteen; extra seats from $15 a month.',
  },
  {
    q: 'What happens if I stop paying?',
    a: 'You keep access to the end of the paid month; after that only Billing and Account open until a plan is chosen. Your data is kept and exportable; closed accounts are deleted after 30 days.',
  },
  {
    q: 'Who sees my data?',
    a: 'Only your business. Each workspace is isolated and that isolation is tested on every release.',
  },
  {
    q: 'Can office staff have limited access?',
    a: 'Yes. Team admins get access page by page; crew get the crew app only.',
  },
  {
    q: 'Can I import my clients from my old software?',
    a: 'Yes: free on Enterprise, quoted on Starter and Small business.',
  },
  {
    q: 'Does it send review requests?',
    a: 'Yes, an automation sends your Google review link after a job, by email or SMS.',
  },
  {
    q: 'Does it do daily site reports?',
    a: 'Yes, on Enterprise: the crew write them with photos; you read and reply; the client gets a completion report.',
  },
  {
    q: 'Can I see overtime?',
    a: 'Yes. Overtime splits by your thresholds (default 8 hours a day, 38 a week); each person can have an overtime rate.',
  },
  {
    q: 'Is my data in Australia?',
    a: "The app is built and run from Australia; hosting is cloud-based (ask us for the current region); AI runs on Anthropic's service.",
  },
  {
    q: 'How do I start?',
    a: 'Start your free trial from any page: leave your details and your login arrives by email, usually the same business day.',
  },
];

/** §10 — what the free-trial form collects. Never passwords, card numbers or an ABN. */
export const inviteFields = [
  { name: 'name', label: 'Your name', type: 'text', required: true, autocomplete: 'name' },
  { name: 'business', label: 'Business name', type: 'text', required: true, autocomplete: 'organization' },
  { name: 'location', label: 'Suburb and state', type: 'text', required: true, placeholder: 'e.g. Northcote, VIC', autocomplete: 'address-level2' },
  { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' },
  { name: 'mobile', label: 'Mobile', type: 'tel', required: false, placeholder: '04…', autocomplete: 'tel' },
  { name: 'crew', label: 'How many on the crew?', type: 'select', required: true, options: ['Just me', '2 to 3', '4 to 6', '7 to 15', 'More than 15'] },
  { name: 'software', label: 'What do you use today?', type: 'text', required: false, placeholder: 'Spreadsheets, another app, pen and paper…' },
] as const;

/** §8 — the people behind it. */
export const story = {
  heading: 'Built by a painter, for painters',
  paragraphs: [
    'Paint Trade HQ is built by Josh Sano, a Melbourne painter who runs Josh Sano Painting and Decorating and got tired of running the business out of five apps and a notebook.',
    'The app is designed round by round to how a painting business actually works: the quote a client can read and sign on their phone, the deposit invoice that follows it, the crew signing in on site, the daily report, the completion report at the end.',
    'Each business has its own private workspace; nobody else can see your clients, quotes or crew. Built in Australia, priced in AUD, GST on top.',
  ],
};

/**
 * Feedback on the home page. Entries marked `sample` show the layout only and carry a visible
 * "Sample" badge; they are left out of the build when PUBLIC_SHOW_SAMPLES=0. Replace them with real
 * words from real painters, with their permission, as they come in.
 */
export type Testimonial = { quote: string; who: string; where: string; sample?: boolean };
export const testimonials: Testimonial[] = [
  { quote: 'Sample quote. A real painter\'s words go here once they have used the app on a few jobs and told us what changed.', who: 'Owner, crew of four', where: 'Sample · Melbourne, VIC', sample: true },
  { quote: 'Sample quote. Something specific: the quote they sent from the ute, the deposit that landed before they got home.', who: 'Sole trader', where: 'Sample · Brisbane, QLD', sample: true },
  { quote: 'Sample quote. Short and plain beats polished. Two sentences is plenty.', who: 'Owner, crew of nine', where: 'Sample · Perth, WA', sample: true },
];

/** Video feedback: a short clip per painter, click to play. `file` lives in public/feedback/. */
export type VideoFeedback = { title: string; who: string; file?: string; poster?: string; seconds?: number; sample?: boolean };
export const videoFeedback: VideoFeedback[] = [
  { title: 'Sample: how quoting changed', who: 'A painter, on their phone, 40 seconds', sample: true },
  { title: 'Sample: the crew and the time clock', who: 'An owner with a crew of six', sample: true },
  { title: 'Sample: getting paid faster', who: 'A sole trader', sample: true },
];
