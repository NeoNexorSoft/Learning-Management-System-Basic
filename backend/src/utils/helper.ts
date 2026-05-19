export const toDate = (value?: string | null): Date | undefined =>
  value ? new Date(value) : undefined;

export const toNullableDate = (value?: string | null): Date | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return new Date(value);
};