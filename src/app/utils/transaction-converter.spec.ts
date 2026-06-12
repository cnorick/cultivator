import { convertDataDictToTransaction, convertTransactionToDataDict } from './transaction-converter';
import { Transaction } from '../types/transaction';

describe('transaction-converter', () => {
  describe('convertDataDictToTransaction', () => {
    it('should map data dictionary values to transaction model properties', () => {
      const dict = {
        account: 'Checking',
        'account_#': '1234',
        amount: 45.67,
        category: 'Food',
        check_number: '101',
        date: 44562, // Jan 1, 2022
        date_added: 44562,
        description: 'Grocery Store',
        full_description: 'Grocery Store #445',
        institution: 'Chase',
        notes: 'Weekly groceries',
        transaction_id: 'tx-001',
      };

      const transaction = convertDataDictToTransaction(dict, 0);

      expect(transaction.account).toBe('Checking');
      expect(transaction['account_#']).toBe('1234');
      expect(transaction.amount).toBe(45.67);
      expect(transaction.category).toBe('Food');
      expect(transaction.check_number).toBe('101');
      expect(transaction.date).toEqual(jasmine.any(Date));
      expect(transaction.description).toBe('Grocery Store');
      expect(transaction.full_description).toBe('Grocery Store #445');
      expect(transaction.institution).toBe('Chase');
      expect(transaction.notes).toBe('Weekly groceries');
      expect(transaction.transaction_id).toBe('tx-001');
      expect(transaction.sheetsRow).toBe(2); // 0 + 2
      expect(transaction.original).toBe(dict);
    });
  });

  describe('convertTransactionToDataDict', () => {
    it('should map partial transaction model back to data dictionary and calculate week/month', () => {
      // Wednesday Jan 5, 2022
      const date = new Date(2022, 0, 5);
      const transaction: Partial<Transaction> = {
        account: 'Savings',
        amount: 1000,
        date: date,
        description: 'Salary',
      };

      const dict = convertTransactionToDataDict(transaction);

      expect(dict['account']).toBe('Savings');
      expect(dict['amount']).toBe(1000);
      expect(dict['date']).toBe(date.toLocaleDateString());
      expect(dict['description']).toBe('Salary');
      // Sunday Jan 2, 2022
      const expectedWeek = new Date(2022, 0, 2).toLocaleDateString();
      // Jan 1, 2022
      const expectedMonth = new Date(2022, 0, 1).toLocaleDateString();
      expect(dict['week']).toBe(expectedWeek);
      expect(dict['month']).toBe(expectedMonth);
    });
  });
});
