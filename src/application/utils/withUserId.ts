export const withObjectValue = (obj: unknown, key: string): string | null => {
  if (typeof obj != 'object' || obj === null || obj[key] === undefined) {
    return null;
  }
  return String(obj[key]);
};
