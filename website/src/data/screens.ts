/**
 * Screenshot and clip slots, mapped to the builder's captures (app repo memory/marketing/*, demo business
 * "Harbourline Painting", 23 Oct 2026). Files live in public/screens and public/clips. Admin screens are
 * 1440×900 (a few also at 1024×900); crew and client pages are 780×1688 (a 390-wide phone at 2x).
 * A slot whose file is missing renders a labelled placeholder, so the site always builds.
 *
 * Chosen deliberately: the Projects module uses the job drawer (16) rather than the board (14) or details
 * (15), which show a demo job over budget in red; Invoices uses the client's phone invoice (21) rather than
 * the admin list (19) or builder (20), which show test-data clients. Approximations per the capture report
 * (33, 36, 42, 44) are used only where nothing better exists.
 */
export type Screen = {
  id: string;
  file: string;
  alt: string;
  caption?: string;
  frame: 'browser' | 'phone' | 'none';
  width: number;
  height: number;
};

const admin = (id: string, file: string, alt: string, caption?: string): Screen => ({ id, file, alt, caption, frame: 'browser', width: 1440, height: 900 });
const phone = (id: string, file: string, alt: string, caption?: string): Screen => ({ id, file, alt, caption, frame: 'phone', width: 780, height: 1688 });

export const screens: Record<string, Screen> = {
  login: admin('login', '01-login-1440.png', 'The Paint Trade HQ sign-in page'),
  dashboard: admin('dashboard', '02-dashboard-1440.png', 'The dashboard: estimates outstanding, live projects, invoices outstanding, crew hours this week, recent activity and the Today briefing', 'Today at a glance.'),
  estimates: admin('estimates', '03-estimates-1440.png', 'The Estimates list with status tabs and totals'),
  'quote-builder': admin('quote-builder', '04-quote-builder-1440.png', 'The quote builder: Living Room and Hallway areas with lines from the Library, measurements and the quote total', 'Areas, lines, optional extras, photos.'),
  'add-work': admin('add-work', '05-add-work-sheet-1440.png', 'The Add work sheet: picking items from the Library by category'),
  'line-details': admin('line-details', '06-line-details-1440.png', 'Line details: unit, quantity, preparation note, print on the quote and show the crew'),
  'quote-details': admin('quote-details', '07-quote-details-1440.png', 'Quote details: terms, payment schedule, warranty line and crew notes'),
  presentation: admin('presentation', '08-presentation-pages-1440.png', 'Presentation pages on a quote: Our work photos, Recent jobs and A bit about us', 'Extra pages on the quote, built from blocks.'),
  'review-send': admin('review-send', '09-review-and-send-1440.png', 'Review & Send: the email on the left, the quote as the client sees it on the right, with a readiness checklist', 'One screen to check, then send.'),
  'client-quote': phone('client-quote', '11-client-quote-signature-390.png', 'The Accept this quote dialog on a phone: the total including GST, the deposit, the client\'s name, a drawn signature and the agreement tick', 'Sign by drawing or typing.'),
  'client-signed': phone('client-signed', '10-client-quote-accept-390.png', 'The accepted quote on a phone with the banner "Accepted by Mia Thompson on 23 Oct 2026"', 'Accepted, signed, dated.'),
  'library-hub': admin('library-hub', '12-library-hub-1440.png', 'The Library hub: items, tasks and products'),
  library: admin('library', '13-library-items-1440.png', 'Library items by category, each with a photo, a per-coat rate and labour minutes', 'Your own prices feed every quote.'),
  projects: admin('projects', '14-projects-1440.png', 'The Live Projects board with status columns and business performance'),
  'project-details': admin('project-details', '16-job-drawer-1440.png', 'A live job: the job site on a map with the geofence radius, the client, the crew, linked records and the Project details drawer with progress', 'The live job, in one place.'),
  'project-full': admin('project-full', '15-project-details-1440.png', 'Project details with start and target finish, schedule, job site and client, crew and linked records'),
  timesheets: admin('timesheets', '17-timesheets-week-1440.png', 'Timesheets: a pay-week grid per crew member with regular and overtime hours, approval status and Export CSV', 'Approve the week, lock it, export payroll.'),
  'timesheets-drawer': admin('timesheets-drawer', '18-timesheets-person-drawer-1440.png', 'A crew member\'s week in the Timesheets drawer with each day\'s sessions'),
  invoices: admin('invoices', '19-invoices-1440.png', 'The Invoices list with outstanding, overdue and collected tiles'),
  'invoice-builder': admin('invoice-builder', '20-invoice-builder-1440.png', 'The invoice builder with the payment schedule from the quote'),
  'client-invoice': phone('client-invoice', '21-client-invoice-390.png', 'The invoice as the client sees it on a phone: Harbourline Painting, invoice number, due date, bill to, what it covers, Download PDF and Print', 'The client\'s invoice, with bank details below.'),
  calendar: admin('calendar', '22-calendar-1440.png', 'The calendar for October 2026 with colour categories for jobs, site visits, reminders, money due, birthdays and Google Calendar', 'Jobs, events and reminders in one view.'),
  'crm-clients': admin('crm-clients', '23-crm-clients-1440.png', 'The CRM clients list'),
  crm: admin('crm', '24-client-page-1440.png', 'A client page in the CRM: lifetime, owed, open quotes, jobs, last touch, an AI client summary, the timeline and contact details', 'Every client on one page.'),
  leads: admin('leads', '25-leads-pipeline-1440.png', 'The leads pipeline from enquiry to quoted to won or lost'),
  employees: admin('employees', '26-employees-1440.png', 'The Employees page: each crew member\'s card with hours this week, missing documents to upload and messages from the crew', 'Records, documents, pay rates, access.'),
  'pay-rates': admin('pay-rates', '27-employee-pay-rates-1440.png', 'An employee\'s pay rates: hourly, daily and overtime'),
  contracts: admin('contracts', '28-contracts-1440.png', 'Contracts: six templates, the employment agreement wording, and the note that the app fills fields and collects signatures but gives no legal advice', 'Your wording, their signature.'),
  'daily-reports': admin('daily-reports', '29-daily-reports-1440.png', 'The admin Daily Reports feed'),
  performance: admin('performance', '30-performance-1440.png', 'The Performance page with validations and score trends'),
  equipment: admin('equipment', '31-equipment-1440.png', 'The Equipment register: tools and gear, who has what, and requests'),
  lucy: admin('lucy', '32-lucy-on-quote-1440.png', 'Lucy, the AI assistant, open beside a quote, answering what the quote total is and when it was sent, with the sources it used', 'Lucy answers from your own data and shows her sources.'),
  files: admin('files', '33-settings-files-storage-1440.png', 'Settings: Files & storage with Paint Trade HQ cloud in use, a connected Google Drive, OneDrive not set up yet, and the Xero connect button not set up yet', 'Our cloud, or your own Google Drive.'),
  'operating-hours': admin('operating-hours', '34-settings-operating-hours-1440.png', 'Settings: operating hours, working days and auto sign-out'),
  'crew-app-settings': admin('crew-app-settings', '35-settings-crew-app-1440.png', 'Settings: which pages and notifications the crew app shows'),
  billing: admin('billing', '36-settings-billing-launch-1440.png', 'Settings: Billing, with "Plans open at launch" and the tester access note'),
  terms: admin('terms', '37-terms-1440.png', 'The Terms of Service page'),
  'crew-signin': phone('crew-signin', '38-crew-signin-390.png', 'The crew app sign-in on a phone'),
  'crew-today': phone('crew-today', '39-crew-today-390.png', 'The crew app Today screen: the time clock, today\'s job with the address, and the inbox'),
  'crew-time-clock': phone('crew-time-clock', '40-crew-time-clock-390.png', 'The crew time clock on a phone: Signed in since 9:16 am, the job, the Sign out button, and the note that location is recorded only at sign-in and sign-out', 'Sign in on site, sign out at knock-off.'),
  'daily-report': phone('daily-report', '41-crew-daily-report-390.png', 'Today\'s report on a phone: hours from sign-ins, what was done, two site photos, any problems, weather and who was on site', 'What happened today, with photos.'),
  'crew-contract': phone('crew-contract', '42-crew-contract-390.png', 'A crew member\'s employment agreement to read and sign on the phone'),
  'crew-equipment': phone('crew-equipment', '43-crew-equipment-request-390.png', 'A crew member requesting equipment from the phone'),
  'completion-report': phone('completion-report', '44-completion-report-390.png', 'The completion report the client receives on a phone: "Your Harbour St interior repaint is finished", the crew, and what was done room by room', 'The job, finished, with photos.'),
};

export type Clip = {
  id: string;
  file: string;
  title: string;
  caption: string;
  /** JPEG frame from the clip itself, in public/clips/posters. */
  poster: string;
  width: number;
  height: number;
  seconds: number;
};

const desktopClip = (id: string, file: string, seconds: number, title: string, caption: string): Clip => ({ id, file, title, caption, poster: file.replace(/\.webm$/, '.jpg'), width: 1440, height: 900, seconds });
const phoneClip = (id: string, file: string, seconds: number, title: string, caption: string): Clip => ({ id, file, title, caption, poster: file.replace(/\.webm$/, '.jpg'), width: 390, height: 844, seconds });

export const clips: Clip[] = [
  desktopClip('signin-to-job-drawer', '01-signin-to-job-drawer.webm', 31, 'Sign in, open today\'s job', 'From the sign-in page to the dashboard, the Live Projects board and a job\'s details.'),
  desktopClip('new-quote-to-sent', '02-new-quote-to-sent.webm', 45, 'A new quote, built and sent', 'Pick the client, add areas and lines from the Library, attach photos, check it in Review & Send, send.'),
  phoneClip('client-accepts-quote', '03-client-accepts-quote.webm', 25, 'The client accepts on their phone', 'Read the quote, tick the agreement, sign, done.'),
  desktopClip('project-to-completion-report', '04-project-to-completion-report.webm', 43, 'From the live job to the completion report', 'The job page, before-and-after photos, and the report the client receives.'),
  phoneClip('crew-clock-in-and-daily-report', '05-crew-clock-in-and-daily-report.webm', 45, 'Crew sign-in and the daily report', 'Sign in on site, then write today\'s report with photos and the end-of-day checks.'),
  desktopClip('timesheets-to-payroll-csv', '06-timesheets-to-payroll-csv.webm', 33, 'Timesheets to payroll CSV', 'Open a crew member\'s week, approve it, export the CSV.'),
  desktopClip('invoice-payment-to-client-page', '07-invoice-payment-to-client-page.webm', 44, 'Invoice, payment, client page', 'Raise the invoice, record the payment, and see the result on the client\'s page.'),
  desktopClip('lucy-client-to-morning-brief', '08-lucy-client-to-morning-brief.webm', 45, 'Lucy on a client, then the morning brief', 'Ask Lucy where things stand with a client, then read the day\'s brief on the dashboard.'),
];
