/**
 * Converts a 0-based index into a Google Sheets Column name (e.g A or AC)
 * @param i the 0-based index to convert
 * @returns
 */
export function convertIndexToCol(i: number): string {
  if (!Number.isInteger(i)) {
    throw new Error('i must be an integer');
  }

  return i < 0
    ? ''
    : convertIndexToCol(Math.floor(i / 26 - 1)) +
        String.fromCharCode((i % 26) + 65);
}
