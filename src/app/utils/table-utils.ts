export function convertTableToDictArray(
  headers: string[],
  data: string[][]
): { [key: string]: any }[] {
  const normalizeHeader = (name: string) =>
    name.toLowerCase().replace(/\s/, '_');

  const cleanHeaders = headers.map((h) => normalizeHeader(h));

  return data.map((row) =>
    row.reduce((acc, col, i) => ({ ...acc, [cleanHeaders[i]]: col }), {})
  );
}
