import { format } from "date-fns";

interface CalendarEventParams {
  contractName: string;
  vendor: string;
  reminderDate: string;
  renewalDate?: string;
}

/**
 * Generate a Google Calendar event URL
 */
export function buildGoogleCalendarUrl({
  contractName,
  vendor,
  reminderDate,
  renewalDate,
}: CalendarEventParams): string {
  const dateStr = reminderDate.replace(/-/g, "");
  const title = `Contract Renewal: ${contractName}`;
  const details = renewalDate
    ? `Contract with ${vendor} renews on ${format(new Date(renewalDate), "MMM d, yyyy")}. Review and take action before the deadline.`
    : `Contract with ${vendor} — review and take action before the deadline.`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateStr}/${dateStr}`,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate and trigger download of an .ics file
 */
export function downloadIcsFile({
  contractName,
  vendor,
  reminderDate,
  renewalDate,
}: CalendarEventParams): void {
  const dateStr = reminderDate.replace(/-/g, "");
  const title = `Contract Renewal: ${contractName}`;
  const description = renewalDate
    ? `Contract with ${vendor} renews on ${format(new Date(renewalDate), "MMM d, yyyy")}. Review and take action before the deadline.`
    : `Contract with ${vendor} — review and take action before the deadline.`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ContractOwl//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${contractName.replace(/\s+/g, "_")}_reminder.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
