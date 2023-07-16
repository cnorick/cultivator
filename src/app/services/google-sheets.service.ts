import { Injectable } from '@angular/core';
import {
  combineLatest,
  filter,
  map,
  switchMap,
  withLatestFrom,
  shareReplay,
  Subject,
  startWith,
} from 'rxjs';
import { GoogleSheetsClientService } from './google-sheets-client.service';
import { convertTableToDictArray, normalizeHeader } from '../utils/table-utils';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';
import { refreshMap } from '../utils/refresh-operator';

const REFRESH_RATE = 60_000;

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsService {
  private onUpdateTransaction$ = new Subject<{
    row: number;
    transaction: any;
  }>();

  private triggerRefresh$ = new Subject<void>();

  private readonly spreadsheetId$ = this.settings.spreadsheetId$;

  private readonly allSheetsResponse$ = combineLatest([
    this.spreadsheetId$,
    this.auth.loggedIn$,
  ]).pipe(
    filter(([spreadsheetId, loggedIn]) => !!spreadsheetId && loggedIn),
    switchMap(([id]) => this.googleClient.getAllSheets(id!)),
    shareReplay()
  );

  private readonly transactionsSheetInfo$ = this.allSheetsResponse$.pipe(
    map((res) =>
      res.sheets.find((sheet: any) =>
        sheet.developerMetadata?.some(
          (metadata: any) =>
            metadata.metadataKey === 'tiller' &&
            JSON.parse(metadata.metadataValue)?.sheetInfo?.id === 'transactions'
        )
      )
    ),
    shareReplay()
  );

  private readonly transactionSheetTitle$ = this.transactionsSheetInfo$.pipe(
    map((info) => info.properties.title as string)
  );

  private readonly categorySheetInfo$ = this.allSheetsResponse$.pipe(
    map((res) =>
      res.sheets.find((sheet: any) =>
        sheet.developerMetadata?.some(
          (metadata: any) =>
            metadata.metadataKey === 'tiller' &&
            JSON.parse(metadata.metadataValue)?.sheetInfo?.id ===
              'categoriesBudget'
        )
      )
    ),
    shareReplay()
  );

  private readonly transactionValuesRes$ = combineLatest([
    this.transactionSheetTitle$,
    this.triggerRefresh$.pipe(startWith('')),
  ]).pipe(
    withLatestFrom(this.spreadsheetId$),
    refreshMap(([[title, _], id]) => {
      return this.googleClient.getSpreadsheetValues(id!, title);
    }, REFRESH_RATE),
    shareReplay()
  );

  private readonly categoryValuesRes$ = this.categorySheetInfo$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([info, id]) =>
      this.googleClient.getSpreadsheetValues(id!, info.properties.title)
    ),
    shareReplay()
  );

  private readonly transactionHeaders$ = this.transactionValuesRes$.pipe(
    map((res) => res.values[0] as (string | number)[]),
    shareReplay()
  );

  private readonly transactionRows$ = this.transactionValuesRes$.pipe(
    map((res) => res.values.slice(1) as (string | number)[][]),
    shareReplay()
  );

  private readonly categoryHeaders$ = this.categoryValuesRes$.pipe(
    map((res) => res.values[0])
  );

  private readonly categoryRows$ = this.categoryValuesRes$.pipe(
    map((res) => res.values.slice(1))
  );

  private readonly doUpdateTransaction$ = this.onUpdateTransaction$.pipe(
    withLatestFrom(
      this.transactionHeaders$,
      this.transactionSheetTitle$,
      this.spreadsheetId$
    ),
    switchMap(([{ transaction, row }, headers, title, id]) => {
      const data = headers.map((h) => transaction[normalizeHeader(h)]);
      return this.googleClient.updateRow(id!, title, row, data);
    }),
    shareReplay()
  );

  public readonly transactionData$ = combineLatest([
    this.transactionHeaders$,
    this.transactionRows$,
  ]).pipe(map(([headers, rows]) => convertTableToDictArray(headers, rows)));

  public readonly categoryData$ = combineLatest([
    this.categoryHeaders$,
    this.categoryRows$,
  ]).pipe(map(([headers, rows]) => convertTableToDictArray(headers, rows)));

  constructor(
    private googleClient: GoogleSheetsClientService,
    private settings: SettingsService,
    private auth: GoogleAuthService
  ) {
    this.allSheetsResponse$.subscribe((res) => console.log(res));
    this.transactionsSheetInfo$.subscribe((res) => console.log(res));
    this.transactionValuesRes$.subscribe((res) => console.log(res));
    this.transactionData$.subscribe((res) => console.log(res));
    this.categorySheetInfo$.subscribe((res) => console.log(res));
    this.categoryValuesRes$.subscribe((res) => console.log(res));
    this.categoryData$.subscribe((res) => console.log(res));
    this.doUpdateTransaction$.subscribe((res) => console.log(res));

    this.doUpdateTransaction$.subscribe(() => {
      this.triggerRefresh$.next();
    });
  }

  public updateTransactionsRow(row: number, transaction: any) {
    this.onUpdateTransaction$.next({ row, transaction });
  }
}
