export function parseLotusDate(
  lotus: number | string | undefined
): Date | null {
  if (typeof lotus === 'string') {
    lotus = Number.parseFloat(lotus);
  }

  if (!lotus || Number.isNaN(lotus)) {
    return null;
  }

  const dec30_1899 = new Date(1899, 11, 30);
  const secondsInDay = 24 * 60 * 60;
  dec30_1899.setDate(dec30_1899.getDate() + Math.floor(lotus));
  dec30_1899.setSeconds(secondsInDay * (lotus - Math.floor(lotus)));
  return dec30_1899;
}

export function createLotusDate(date: Date): any {
  // const utcDate = date;
  // const dec30_1899_utc = Date.parse('1899-12-30');
  // return (utcDate.getTime() - dec30_1899_utc) / (24 * 60 * 60 * 1000);
}

export function convertDateToUTC(date: Date): Date {
  {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
  }
}
