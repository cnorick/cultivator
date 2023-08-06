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
import { convertDataDictToTransaction } from '../utils/transaction-converter';
import { GoogleSheetsService } from './google-sheets.service';
import { SettingsService } from './settings.service';

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
  ]).pipe(
    map(([transactions, limit, filters]) =>
      filters
        .reduce((acc, filter) => acc.filter(filter), transactions)
        .slice(0, limit)
        .sort((t1, t2) => (t2.date?.getTime() ?? 0) - (t1.date?.getTime() ?? 0))
    ),
    startWith(null),
    shareReplay()
  );

  public setFilters(filters: TransactionFilter[]) {
    this.filters$.next(filters);
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
}
