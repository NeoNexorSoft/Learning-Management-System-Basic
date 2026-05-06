export const formatSettings = (settings: { key: string; value: string }[]) => {
  return Object.fromEntries(
    settings.map(({ key, value }) => {
      if (value === 'true') return [key, true];
      if (value === 'false') return [key, false];
      if (!isNaN(Number(value))) return [key, Number(value)];
      return [key, value];
    })
  );
};