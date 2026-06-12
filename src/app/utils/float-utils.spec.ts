import { areFloatsEqual } from './float-utils';

describe('areFloatsEqual', () => {
  it('should return true for identical floats', () => {
    expect(areFloatsEqual(1.2345, 1.2345)).toBeTrue();
  });

  it('should return true for floats within epsilon', () => {
    expect(areFloatsEqual(1.2345, 1.23451, 0.0001)).toBeTrue();
  });

  it('should return false for floats outside epsilon', () => {
    expect(areFloatsEqual(1.2345, 1.2347, 0.0001)).toBeFalse();
  });

  it('should use default epsilon of 0.0001', () => {
    expect(areFloatsEqual(1.2345, 1.23459)).toBeTrue();
    expect(areFloatsEqual(1.2345, 1.23461)).toBeFalse();
  });
});
