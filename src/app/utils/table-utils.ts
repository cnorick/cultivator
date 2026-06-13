export function convertTableToDictArray(
  headers: (string | number)[],
  data: (string | number)[][]
): Record<string, string>[] {
  const cleanHeaders = headers.map((h) => normalizeHeader(h));

  return data.map((row) =>
    row.reduce((acc, col, i) => ({ ...acc, [cleanHeaders[i]]: col }), {})
  );
}

export function normalizeHeader(header: string | number) {
  return typeof header === 'string'
    ? header.toLowerCase().replace(/\s/, '_')
    : header;
}
