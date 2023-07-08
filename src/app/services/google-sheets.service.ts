import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GoogleSheetsClientService } from '../google-sheets-client.service';
import { convertTableToDictArray } from '../utils/table-utils';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsService {
  private spreadsheetUrl$ = new BehaviorSubject<string | undefined>(undefined);
  private spreadsheetId$ = this.spreadsheetUrl$.pipe(
    map((url) => this.googleClient.getSpreadsheetIdFromUrl(url))
  );

  private allSheetsResponse$ = this.spreadsheetId$.pipe(
    filter((id) => !!id),
    switchMap((id) => this.googleClient.getAllSheets(id!))
  );

  private transactionsSheetInfo$ = this.allSheetsResponse$.pipe(
    map((res) =>
      res.sheets.find((sheet: any) =>
        sheet.developerMetadata?.some(
          (metadata: any) =>
            metadata.metadataKey === 'tiller' &&
            JSON.parse(metadata.metadataValue)?.sheetInfo?.id === 'transactions'
        )
      )
    )
  );

  private transactionValuesRes$ = this.transactionsSheetInfo$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([info, id]) =>
      this.googleClient.getSpreadsheetValues(id!, info.properties.title)
    )
  );

  private transactionHeaders$ = this.transactionValuesRes$.pipe(
    map((res) => res.values[0])
  );

  private transactionRows$ = this.transactionValuesRes$.pipe(
    map((res) => res.values.slice(1))
  );

  private transactionData$ = combineLatest([
    this.transactionHeaders$,
    this.transactionRows$,
  ]).pipe(map(([headers, rows]) => convertTableToDictArray(headers, rows)));

  constructor(private googleClient: GoogleSheetsClientService) {
    this.allSheetsResponse$.subscribe((res) => console.log(res));
    this.transactionsSheetInfo$.subscribe((res) => console.log(res));
    this.transactionValuesRes$.subscribe((res) => console.log(res));
    this.transactionData$.subscribe((res) => console.log(res));
  }

  public setSpreadsheetUrl(url: string) {
    // TODO: save to local storage
    this.spreadsheetUrl$.next(url);
  }
}
