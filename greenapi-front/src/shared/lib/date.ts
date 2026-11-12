const DAY_MS = 86_400_000;

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
const dayYearFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const shortDateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

type DateInput = string | number | Date;

function startOfDay(value: DateInput) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(value: DateInput) {
  return Math.round((startOfDay(Date.now()).getTime() - startOfDay(value).getTime()) / DAY_MS);
}

export function dayKey(value: DateInput) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function formatTime(value: DateInput) {
  return timeFormat.format(new Date(value));
}

export function formatDayLabel(value: DateInput) {
  const date = new Date(value);
  const days = daysAgo(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.getFullYear() === new Date().getFullYear()
    ? dayFormat.format(date)
    : dayYearFormat.format(date);
}

export function formatListDate(value: DateInput) {
  const date = new Date(value);
  const days = daysAgo(date);
  if (days === 0) return formatTime(date);
  if (days < 7) return weekdayFormat.format(date);
  return shortDateFormat.format(date);
}
