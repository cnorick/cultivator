import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(
    private googleSheets: GoogleSheetsService,
    private settings: SettingsService
  ) {}

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
            t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.full_description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
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
    console.log(transaction);
    const id = `${uuidv4()}-manual`;
    const dataDict = {
      ...convertTransactionToDataDict(transaction),
      transaction_id: id,
    };

    this.googleSheets.addTransactionRow(dataDict);
    return id;
  }
}
