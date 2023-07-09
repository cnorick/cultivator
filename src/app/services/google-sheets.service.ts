import { Injectable } from '@angular/core';
import {
  combineLatest,
  filter,
  map,
  switchMap,
  withLatestFrom,
  shareReplay,
} from 'rxjs';
import { GoogleSheetsClientService } from './google-sheets-client.service';
import { convertTableToDictArray } from '../utils/table-utils';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsService {
  private readonly spreadsheetId$ = this.settings.spreadsheetUrl$.pipe(
    map((url) => this.googleClient.getSpreadsheetIdFromUrl(url))
  );

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

  private readonly transactionValuesRes$ = this.transactionsSheetInfo$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([info, id]) =>
      this.googleClient.getSpreadsheetValues(id!, info.properties.title)
    ),
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
    map((res) => res.values[0])
  );

  private readonly transactionRows$ = this.transactionValuesRes$.pipe(
    map((res) => res.values.slice(1))
  );

  private readonly categoryHeaders$ = this.categoryValuesRes$.pipe(
    map((res) => res.values[0])
  );

  private readonly categoryRows$ = this.categoryValuesRes$.pipe(
    map((res) => res.values.slice(1))
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
  }
}
