import { Transaction } from '../types/transaction';
import { createLotusDate, parseLotusDate } from './date-utils';

type DataDict = { [key: string]: string | number | undefined };

export function convertDataDictToTransaction(
  dict: DataDict,
  index: number
): Transaction {
  return {
    account: dict['account']?.toString(),
    'account_#': dict['account_#']?.toString(),
    amount: dict['amount'] as unknown as number,
    category: dict['category']?.toString(),
    check_number: dict['check_number']?.toString(),
    date: parseLotusDate(dict['date']) ?? undefined,
    date_added: parseLotusDate(dict['date_added']) ?? undefined,
    description: dict['description']?.toString(),
    full_description: dict['full_description']?.toString(),
    institution: dict['institution']?.toString(),
    notes: dict['notes']?.toString(),
    transaction_id: dict['transaction_id']?.toString(),
    sheetsRow: index + 2,
    original: dict,
  };
}

export function convertTransactionToDataDict(
  transaction: Transaction
): DataDict {
  return {
    ...transaction.original,
    account: transaction.account ?? '',
    'account_#': transaction['account_#'] ?? '',
    amount: transaction.amount,
    category: transaction.category ?? '',
    check_number: transaction.check_number ?? '',
    date: transaction.date && createLotusDate(transaction.date),
    date_added:
      transaction.date_added && createLotusDate(transaction.date_added),
    description: transaction.description ?? '',
    full_description: transaction.full_description ?? '',
    institution: transaction.institution ?? '',
    notes: transaction.notes ?? '',
    transaction_id: transaction.transaction_id ?? '',
  };
}
