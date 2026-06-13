import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
  startWith,
} from 'rxjs';
import { Category, CATEGORY_LOADING_VAL } from '../types/category';
import { Transaction } from '../types/transaction';
import {
  convertDataDictToTransaction,
  convertTransactionToDataDict,
} from '../utils/transaction-converter';
import { GoogleSheetsService } from './google-sheets.service';
import { SettingsService } from './settings.service';
import { v4 as uuidv4 } from 'uuid';

export type TransactionFilter = (
  transaction: Transaction,
  index?: number,
  transactions?: Transaction[]
) => boolean;

export interface TransactionSplit {
  category: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private googleSheets = inject(GoogleSheetsService);
  private settings = inject(SettingsService);


  private loadMoreSteps$ = new BehaviorSubject(1);
  private limit$ = combineLatest([
    this.loadMoreSteps$,
    this.settings.initialTransactionsLoaded$,
  ]).pipe(map(([loadMoreSteps, stepSize]) => loadMoreSteps * stepSize));

  private filters$ = new BehaviorSubject<TransactionFilter[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');

  public readonly transactions$ = this.googleSheets.transactionData$.pipe(
    map((transactions) =>
      transactions.map<Transaction>((t, i) =>
        convertDataDictToTransaction(t, i)
      )
    ),
    shareReplay()
  );

  public readonly shownTransactions$ = combineLatest([
    this.transactions$,
    this.limit$,
    this.filters$,
    this.searchTerm$,
  ]).pipe(
    map(([transactions, limit, filters, searchTerm]) =>
      filters
        .reduce((acc, filter) => acc.filter(filter), transactions)
        .filter(
          (t) =>
            searchTerm.trim() === '' ||
            t.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase().trim()) ||
            t.full_description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase().trim()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            t.amount?.toString().includes(parseFloat(searchTerm).toString())
        )
        .slice(0, limit)
        .sort((t1, t2) => (t2.date?.getTime() ?? 0) - (t1.date?.getTime() ?? 0))
    ),
    startWith(null),
    shareReplay()
  );

  public setFilters(filters: TransactionFilter[]) {
    this.filters$.next(filters);
  }

  public setSearch(search: string) {
    this.searchTerm$.next(search);
  }

  public getSearch(): string {
    return this.searchTerm$.getValue();
  }

  public updateCategory(transaction: Transaction, category: Category) {
    const dataDict = { ...transaction.original, category: category.category };

    transaction.category = CATEGORY_LOADING_VAL;
    this.googleSheets.updateTransactionsRow(transaction.sheetsRow, dataDict);
  }

  public updateNotes(transaction: Transaction, notes: string) {
    const dataDict = { ...transaction.original, notes };
    transaction.notes = CATEGORY_LOADING_VAL;

    this.googleSheets.updateTransactionsRow(transaction.sheetsRow, dataDict);
  }

  public addManualTransaction(transaction: Partial<Transaction>) {
    const id = `${uuidv4()}-manual`;
    const dataDict = {
      ...convertTransactionToDataDict(transaction),
      transaction_id: id,
    };

    this.googleSheets.addTransactionRow(dataDict);
    return id;
  }

  public splitTransaction(
    transaction: Transaction,
    splits: TransactionSplit[]
  ) {
    const [firstSplit, ...restSplits] = splits;

    console.log('Splitting transaction', transaction, 'into', splits);

    // Update the original transaction with firstSplit.
    this.googleSheets.updateTransactionsRow(transaction.sheetsRow, {
      ...transaction.original,
      category: firstSplit.category,
      amount: firstSplit.amount,
    });

    // Create new transactions for the rest of the splits.
    const splitsData = restSplits.map((split) => ({
      ...convertTransactionToDataDict(transaction),
      transaction_id: `${uuidv4()}-split`,
      category: split.category,
      amount: split.amount,
      sheetsRow: null,
    }));

    this.googleSheets.addTransactionRows(splitsData, transaction.sheetsRow + 1);
  }

  public createTransfer(config: {
    from: Category;
    to: Category;
    amount: number;
    date?: Date;
    description?: string;
    notes?: string;
  }) {
    const { from, to, amount, date = new Date(), description, notes } = config;

    const fromTransaction: Partial<Transaction> = {
      transaction_id: `${uuidv4()}-transfer`,
      amount: -amount,
      category: from.category,
      date,
      date_added: new Date(),
      description: `Transfer from ${from.category} to ${to.category}`,
      full_description: `${description || 'Transfer out'} from ${
        from.category
      }`,
      account: 'manual',
      institution: 'Manual Transaction',
      ...(notes && { notes }),
    };

    const toTransaction: Partial<Transaction> = {
      transaction_id: `${uuidv4()}-transfer`,
      amount,
      category: to.category,
      date,
      date_added: new Date(),
      description: `Transfer from ${from.category} to ${to.category}`,
      full_description: `${description || 'Transfer in'} to ${to.category}`,
      account: 'manual',
      institution: 'Manual Transaction',
      ...(notes && { notes }),
    };

    this.googleSheets.addTransactionRows(
      [fromTransaction, toTransaction].map(convertTransactionToDataDict)
    );
  }
}
