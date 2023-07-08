import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Transaction } from '../types/transaction';
import { GoogleSheetsService } from './google-sheets.service';
import { SettingsService } from './settings.service';

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

  private readonly transactions$ = this.googleSheets.transactionData$.pipe(
    map((transactions) =>
      transactions.map<Transaction>((t) => ({
        account: t['account'],
        'account_#': t['account_#'],
        amount: Number.parseFloat(t['amount']),
        category: t['category'],
        check_number: t['check_number'],
        date: new Date(t['date']),
        date_added: new Date(t['date_added']),
        description: t['description'],
        full_description: t['full_description'],
        institution: t['institution'],
        notes: t['notes'],
        transaction_id: t['transaction_id'],
      }))
    )
  );

  public readonly shownTransactions$ = combineLatest([
    this.transactions$,
    this.limit$,
  ]).pipe(map(([transactions, limit]) => transactions.slice(0, limit)));
}
