import { convertIndexToCol } from './convert-index-to-column';

describe('convertIndexToCol', () => {
  it('should convert index 0 to A', () => {
    expect(convertIndexToCol(0)).toBe('A');
  });

  it('should convert index 25 to Z', () => {
    expect(convertIndexToCol(25)).toBe('Z');
  });

  it('should convert index 26 to AA', () => {
    expect(convertIndexToCol(26)).toBe('AA');
  });

  it('should convert index 27 to AB', () => {
    expect(convertIndexToCol(27)).toBe('AB');
  });

  it('should convert index 701 to ZZ', () => {
    expect(convertIndexToCol(701)).toBe('ZZ');
  });

  it('should convert index 702 to AAA', () => {
    expect(convertIndexToCol(702)).toBe('AAA');
  });

  it('should return empty string for negative numbers', () => {
    expect(convertIndexToCol(-1)).toBe('');
    expect(convertIndexToCol(-10)).toBe('');
  });

  it('should throw an error for non-integer inputs', () => {
    expect(() => convertIndexToCol(1.5)).toThrowError('i must be an integer');
  });
});
