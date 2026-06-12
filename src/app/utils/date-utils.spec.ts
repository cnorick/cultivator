import { parseLotusDate, convertDateToUTC } from './date-utils';

describe('date-utils', () => {
  describe('parseLotusDate', () => {
    it('should return null for undefined input', () => {
      expect(parseLotusDate(undefined)).toBeNull();
    });

    it('should return null for invalid inputs', () => {
      expect(parseLotusDate('not-a-number')).toBeNull();
      expect(parseLotusDate(NaN)).toBeNull();
    });

    it('should parse lotus integer correctly', () => {
      // 0 days from Dec 30, 1899 (Note: month is 0-indexed, so 11 is December)
      const date = parseLotusDate(1);
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(1899);
      expect(date?.getMonth()).toBe(11);
      expect(date?.getDate()).toBe(31);
    });

    it('should parse lotus with fraction correctly', () => {
      const date = parseLotusDate(1.5);
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(1899);
      expect(date?.getMonth()).toBe(11);
      expect(date?.getDate()).toBe(31);
      expect(date?.getHours()).toBe(12);
    });

    it('should accept lotus serial number as string', () => {
      const date = parseLotusDate('2.25');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(1900);
      expect(date?.getMonth()).toBe(0); // January
      expect(date?.getDate()).toBe(1);
      expect(date?.getHours()).toBe(6);
    });
  });

  describe('convertDateToUTC', () => {
    it('should convert local date to UTC date keeping same date/time fields', () => {
      const localDate = new Date(2023, 5, 15, 10, 30, 0); // June 15, 2023 10:30:00
      const utcDate = convertDateToUTC(localDate);
      expect(utcDate.getFullYear()).toBe(localDate.getUTCFullYear());
      expect(utcDate.getMonth()).toBe(localDate.getUTCMonth());
      expect(utcDate.getDate()).toBe(localDate.getUTCDate());
      expect(utcDate.getHours()).toBe(localDate.getUTCHours());
    });
  });
});
