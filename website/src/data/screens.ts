/**
 * Screenshot and clip slots. The files live in public/screens and public/clips and come from the
 * app repo (memory/marketing/screens, memory/marketing/clips; demo business "Harbourline Painting").
 * `file` is filled in once the zip arrives; until then the components render a labelled placeholder,
 * so the site builds either way. Widths: admin 1440 (some 1024), crew and client pages 390.
 */
export type Screen = {
  id: string;
  file: string; // e.g. '05-dashboard-1440.png' — empty until mapped
  alt: string;
  caption?: string;
  frame: 'browser' | 'phone' | 'none';
  width: number;
  height: number;
};

export const screens: Record<string, Screen> = {
  login: { id: 'login', file: '01-login-1440.png', alt: 'The Paint Trade HQ sign-in page', frame: 'browser', width: 1440, height: 900 },
  dashboard: { id: 'dashboard', file: '', alt: 'The dashboard: quotes out, jobs on, money owed, today\'s jobs and the morning brief', caption: 'Today at a glance.', frame: 'browser', width: 1440, height: 900 },
  library: { id: 'library', file: '', alt: 'The Library: items with a rate, minutes and a photo', caption: 'Your own prices feed every quote.', frame: 'browser', width: 1440, height: 900 },
  'quote-builder': { id: 'quote-builder', file: '', alt: 'The estimate builder with areas, lines from the Library and the quote total', caption: 'Areas, lines, optional extras, photos.', frame: 'browser', width: 1440, height: 900 },
  'client-quote': { id: 'client-quote', file: '', alt: 'The quote as the client sees it on their phone, with Accept and sign', caption: 'What your client gets: read, tick, sign.', frame: 'phone', width: 390, height: 844 },
  'client-signed': { id: 'client-signed', file: '', alt: 'The accepted quote showing who signed and when', caption: 'Signed, dated, recorded.', frame: 'phone', width: 390, height: 844 },
  'project-details': { id: 'project-details', file: '', alt: 'Project details: the accepted quote, crew, products, photos, labour cost and margin', caption: 'The live job, in one place.', frame: 'browser', width: 1440, height: 900 },
  projects: { id: 'projects', file: '', alt: 'The Projects page: every job in flight with status and crew', frame: 'browser', width: 1440, height: 900 },
  timesheets: { id: 'timesheets', file: '', alt: 'Timesheets: a week grid per person with overtime split and payroll CSV', caption: 'Approve the week, lock it, export payroll.', frame: 'browser', width: 1440, height: 900 },
  'crew-time-clock': { id: 'crew-time-clock', file: '', alt: 'The crew app time clock: sign in and sign out on the phone', caption: 'Sign in on site, sign out at knock-off.', frame: 'phone', width: 390, height: 844 },
  'daily-report': { id: 'daily-report', file: '', alt: 'A daily site report written on the phone with photos', caption: 'What happened today, with photos.', frame: 'phone', width: 390, height: 844 },
  invoice: { id: 'invoice', file: '', alt: 'An invoice with bank details and the payment record', caption: 'Deposit, progress, final. Paid by bank transfer.', frame: 'browser', width: 1440, height: 900 },
  'client-invoice': { id: 'client-invoice', file: '', alt: 'The invoice as the client sees it on their phone, with bank details and Download PDF', frame: 'phone', width: 390, height: 844 },
  calendar: { id: 'calendar', file: '', alt: 'The calendar with jobs, events and reminders in colour categories', frame: 'browser', width: 1440, height: 900 },
  employees: { id: 'employees', file: '', alt: 'The Employees page with profiles, documents and pay rates', frame: 'browser', width: 1440, height: 900 },
  contracts: { id: 'contracts', file: '', alt: 'A contract template and the issue wizard', frame: 'browser', width: 1440, height: 900 },
  'crew-contract': { id: 'crew-contract', file: '', alt: 'A crew member signing their contract on the phone', frame: 'phone', width: 390, height: 844 },
  crm: { id: 'crm', file: '', alt: 'A client page in the CRM: quotes, invoices, jobs and messages on one page', frame: 'browser', width: 1440, height: 900 },
  lucy: { id: 'lucy', file: '', alt: 'Lucy, the AI assistant, answering from the business\'s own data', caption: 'Lucy drafts, briefs and summarises. You check.', frame: 'browser', width: 1440, height: 900 },
  files: { id: 'files', file: '', alt: 'Files and storage settings: Paint Trade HQ cloud or your own Google Drive', frame: 'browser', width: 1440, height: 900 },
  'completion-report': { id: 'completion-report', file: '44-completion-report-390.png', alt: 'The completion report the client receives, with before and after photos', caption: 'The job, finished, with photos.', frame: 'phone', width: 390, height: 844 },
};

export type Clip = { id: string; file: string; title: string; caption: string };

export const clips: Clip[] = [
  { id: 'signin-to-job-drawer', file: '01-signin-to-job-drawer.webm', title: 'Sign in to the job drawer', caption: 'From sign-in to today\'s job in a few seconds.' },
  { id: 'lucy-client-to-morning-brief', file: '08-lucy-client-to-morning-brief.webm', title: 'Lucy: a client question, then the morning brief', caption: 'Ask about a client, then read the day\'s brief.' },
];
