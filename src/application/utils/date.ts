export function toIsoString(date: unknown): string {
  if (date instanceof Date) {
    return new Date(date.getTime()).toISOString();
  }
  if (typeof date === 'string') {
    return new Date(new Date(date).getTime()).toISOString();
  }
  return String(date);
  // const tzOffset = -date.getTimezoneOffset();
  // const diff = tzOffset >= 0 ? '+' : '-';
  // const pad = (n : number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  // return date.getFullYear() +
  //     '-' + pad(date.getMonth() + 1) +
  //     '-' + pad(date.getDate()) +
  //     'T' + pad(date.getHours()) +
  //     ':' + pad(date.getMinutes()) +
  //     ':' + pad(date.getSeconds()) +
  //     diff + pad(tzOffset / 60) +
  //     ':' + pad(tzOffset % 60);
}
