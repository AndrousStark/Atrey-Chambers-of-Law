// ============================================================
// Calendar Link Generators — Google Calendar, Outlook, .ics
// ============================================================

interface CalendarEventParams {
  readonly caseNo: string;
  readonly caseTitle: string;
  readonly court: string;
  readonly client: string;
  readonly ndoh: string; // "DD.MM.YYYY"
  readonly status: string;
  readonly remarks: string | null;
  readonly bench: string | null;
  readonly presidingJudge: string | null;
}

function parseNdoh(ndoh: string): { year: number; month: number; day: number } | null {
  const parts = ndoh.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const year = parseInt(parts[2]!, 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return { day, month, year };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function buildDetails(p: CalendarEventParams): string {
  return [
    `Case: ${p.caseNo}`,
    `Title: ${p.caseTitle}`,
    `Court: ${p.court}`,
    `Client: ${p.client}`,
    `Status: ${p.status}`,
    p.bench ? `Bench: ${p.bench}` : '',
    p.presidingJudge ? `Judge: ${p.presidingJudge}` : '',
    p.remarks ? `Remarks: ${p.remarks}` : '',
  ].filter(Boolean).join('\n');
}

function getLocation(court: string): string {
  if (court.includes('Supreme Court')) return 'Supreme Court of India, Tilak Marg, New Delhi';
  if (court.includes('Delhi')) return 'High Court of Delhi, Sher Shah Road, New Delhi';
  if (court.includes('Uttarakhand')) return 'High Court of Uttarakhand, Nainital';
  return court;
}

/**
 * Generate Google Calendar "Add Event" URL
 */
export function buildGoogleCalendarUrl(params: CalendarEventParams): string | null {
  const d = parseNdoh(params.ndoh);
  if (!d) return null;

  const startDate = `${d.year}${pad2(d.month)}${pad2(d.day)}`;
  const endDate = new Date(d.year, d.month - 1, d.day + 1);
  const endStr = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `Hearing: ${params.caseNo}`);
  url.searchParams.set('dates', `${startDate}/${endStr}`);
  url.searchParams.set('details', buildDetails(params));
  url.searchParams.set('location', getLocation(params.court));
  return url.toString();
}

/**
 * Generate Outlook.com "Add Event" URL
 */
export function buildOutlookCalendarUrl(params: CalendarEventParams): string | null {
  const d = parseNdoh(params.ndoh);
  if (!d) return null;

  const startDate = `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
  const endDate = new Date(d.year, d.month - 1, d.day + 1);
  const endStr = `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(endDate.getDate())}`;

  const url = new URL('https://outlook.live.com/calendar/0/action/compose');
  url.searchParams.set('subject', `Hearing: ${params.caseNo}`);
  url.searchParams.set('startdt', startDate);
  url.searchParams.set('enddt', endStr);
  url.searchParams.set('body', buildDetails(params));
  url.searchParams.set('location', getLocation(params.court));
  url.searchParams.set('allday', 'true');
  return url.toString();
}

/**
 * Generate .ics file content for a single hearing
 */
export function buildIcsContent(params: CalendarEventParams): string | null {
  const d = parseNdoh(params.ndoh);
  if (!d) return null;

  const startDate = `${d.year}${pad2(d.month)}${pad2(d.day)}`;
  const endDate = new Date(d.year, d.month - 1, d.day + 1);
  const endStr = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `hearing-${params.caseNo.replace(/[^a-zA-Z0-9]/g, '-')}@atreychambers.com`;

  const description = buildDetails(params).replace(/\n/g, '\\n');
  const location = getLocation(params.court);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atrey Chambers CMS//Hearing Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `DTSTAMP:${now}`,
    `UID:${uid}`,
    `SUMMARY:Hearing: ${params.caseNo}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hearing tomorrow',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hearing in 3 days',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Download .ics file in browser
 */
export function downloadIcs(params: CalendarEventParams): void {
  const content = buildIcsContent(params);
  if (!content) return;

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hearing-${params.caseNo.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
