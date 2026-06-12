import { convertTableToDictArray, normalizeHeader } from './table-utils';

describe('table-utils', () => {
  describe('normalizeHeader', () => {
    it('should convert string to lowercase and replace first space with underscore', () => {
      expect(normalizeHeader('Transaction ID')).toBe('transaction_id');
      expect(normalizeHeader('Account Number')).toBe('account_number');
    });

    it('should return non-string headers unchanged', () => {
      expect(normalizeHeader(123)).toBe(123);
    });
  });

  describe('convertTableToDictArray', () => {
    it('should convert headers and data rows into dictionaries', () => {
      const headers = ['Account', 'Transaction ID', 'Amount'];
      const data = [
        ['Chase Checking', 'tx-123', 50.5],
        ['Wells Fargo Savings', 'tx-456', 100],
      ];

      const result = convertTableToDictArray(headers, data);

      expect(result as any).toEqual([
        { account: 'Chase Checking', transaction_id: 'tx-123', amount: 50.5 },
        { account: 'Wells Fargo Savings', transaction_id: 'tx-456', amount: 100 },
      ]);
    });
  });
});
