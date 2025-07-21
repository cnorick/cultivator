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
  of,
  retry,
  tap,
  BehaviorSubject,
  distinctUntilChanged,
  delay,
  share,
} from 'rxjs';
import { GoogleSheetsClientService } from './google-sheets-client.service';
import { convertTableToDictArray, normalizeHeader } from '../utils/table-utils';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';
import { refreshMap } from '../utils/refresh-operator';
import { LogService } from './log.service';
import { NOTES_HEADER } from './features.service';
import { CultivatorMetadata } from '../types/cultivator-metadata';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsService {
  private static readonly METADATA_KEY = 'cultivator';

  private onUpdateTransaction$ = new Subject<{
    row: number;
    transaction: any;
  }>();

  private onAppendTransactions$ = new Subject<{
    transactions: any[];
    rowNum?: number;
  }>();

  private onAddTransactionHeader$ = new Subject<{
    header: string | number;
  }>();

  private onUpdateGlobalMetadata$ = new Subject<Partial<CultivatorMetadata>>();

  private onDeleteGlobalMetadata$ = new Subject<void>();

  private triggerTransactionRefresh$ = new Subject<void>();

  private triggerFullRefresh$ = new Subject<void>();

  private _isOnline = new BehaviorSubject<boolean>(true);

  private readonly spreadsheetId$ = this.settings.spreadsheetId$;

  private readonly refreshRate$ = this.settings.refreshRateSeconds$.pipe(
    map((seconds) => seconds * 1000),
    distinctUntilChanged()
  );

  private readonly allSheetsResponse$ = combineLatest([
    this.spreadsheetId$,
    this.auth.loggedIn$,
    this.triggerFullRefresh$.pipe(startWith('')),
  ]).pipe(
    filter(([spreadsheetId, loggedIn]) => !!spreadsheetId && loggedIn),
    switchMap(([id]) => this.googleClient.getAllSheets(id!)),
    shareReplay()
  );

  public readonly isOnline$ = this._isOnline.asObservable();

  public readonly cultivatorGlobalDeveloperMetadataValue$ =
    this.allSheetsResponse$.pipe(
      map((res) => res.developerMetadata as any[]),
      map((metadataArr) =>
        metadataArr.find(
          (m) => m.metadataKey === GoogleSheetsService.METADATA_KEY
        )
      ),
      map((metadataEntry) =>
        !!metadataEntry?.metadataValue
          ? (JSON.parse(metadataEntry.metadataValue) as CultivatorMetadata)
          : null
      ),
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

  private readonly transactionValuesRes$ = this.refreshRate$.pipe(
    switchMap((refreshRate) =>
      combineLatest([
        this.transactionSheetTitle$,
        this.triggerTransactionRefresh$.pipe(startWith('')),
        this.settings.maxTransactionRows$,
      ]).pipe(
        withLatestFrom(this.spreadsheetId$),
        refreshMap(([[title, _, maxTransactionRows], id]) => {
          // If 0 or nullish, get all rows. Otherwise, limit to the specified number of rows.
          if (maxTransactionRows) {
            return this.googleClient.getSpreadsheetValues(
              id!,
              `${title}!1:${maxTransactionRows + 1}` // sheets is 1-indexed
            );
          }
          else {
            return this.googleClient.getSpreadsheetValues(id!, title);
          }
        }, refreshRate),
        tap({
          next: (res) => this._isOnline.next(true),
          error: (err) => this._isOnline.next(false),
        }),
        share()
      )
    ),
    retry({
      delay: (error, retryCount) => {
        // Exponential backoff: 2^retryCount * 1000ms, max 60s
        const delayMs = Math.min(Math.pow(2, retryCount) * 1000, 60000);
        return of(error).pipe(delay(delayMs));
      },
    }),
    shareReplay()
  );

  private readonly categoryValuesRes$ = this.categorySheetInfo$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([info, id]) =>
      this.googleClient.getSpreadsheetValues(id!, info.properties.title)
    ),
    shareReplay()
  );

  public readonly transactionHeaders$ = this.transactionValuesRes$.pipe(
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

  private readonly doAppendTransaction$ = this.onAppendTransactions$.pipe(
    withLatestFrom(
      this.transactionHeaders$,
      this.transactionSheetTitle$,
      this.spreadsheetId$
    ),
    switchMap(([{ transactions, rowNum }, headers, title, id]) => {
      const data = transactions.map(t => headers.map((h) => t[normalizeHeader(h)]));

      // Append after rowNum if provided, otherwise append to the top of the sheet after the headers.
      return this.googleClient.appendRows(id!, title, rowNum ?? 3, data);
    })
  );

  private readonly doAddTransactionHeader$ = this.onAddTransactionHeader$.pipe(
    withLatestFrom(
      this.transactionHeaders$,
      this.transactionSheetTitle$,
      this.spreadsheetId$
    ),
    switchMap(([{ header }, existingHeaders, title, id]) => {
      const headerAlreadyExists = existingHeaders.some(
        (existingHeader) =>
          existingHeader.toString().toLowerCase() ===
          header.toString().toLowerCase()
      );
      if (headerAlreadyExists) {
        return of(null);
      }

      const updatedHeaders = [...existingHeaders, header];
      return this.googleClient.updateRow(id!, title, 1, updatedHeaders);
    })
  );

  private readonly doUpdateGlobalMetadata$ = this.onUpdateGlobalMetadata$.pipe(
    withLatestFrom(
      this.cultivatorGlobalDeveloperMetadataValue$,
      this.spreadsheetId$
    ),
    switchMap(([newMetadata, existingMetadata, spreadsheetId]) => {
      if (!existingMetadata) {
        return this.googleClient.addGlobalMetadata(
          spreadsheetId!,
          GoogleSheetsService.METADATA_KEY,
          JSON.stringify(newMetadata),
          'DOCUMENT'
        );
      } else {
        const updatedMetadata = { ...existingMetadata, ...newMetadata };
        return this.googleClient.updateGlobalMetadata(
          spreadsheetId!,
          GoogleSheetsService.METADATA_KEY,
          JSON.stringify(updatedMetadata),
          'DOCUMENT'
        );
      }
    })
  );

  private readonly doDeleteGlobalMetadata$ = this.onDeleteGlobalMetadata$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([_, spreadsheetId]) =>
      this.googleClient.deleteGlobalMetadata(
        spreadsheetId!,
        GoogleSheetsService.METADATA_KEY
      )
    )
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
    private auth: GoogleAuthService,
    logger: LogService
  ) {
    this.allSheetsResponse$.subscribe((res) => logger.log(res));
    this.transactionsSheetInfo$.subscribe((res) => logger.log(res));
    this.transactionValuesRes$.subscribe((res) => logger.log(res));
    this.transactionData$.subscribe((res) => logger.log(res));
    this.categorySheetInfo$.subscribe((res) => logger.log(res));
    this.categoryValuesRes$.subscribe((res) => logger.log(res));
    this.categoryData$.subscribe((res) => logger.log(res));
    this.doUpdateTransaction$.subscribe((res) => logger.log(res));
    this.doAddTransactionHeader$.subscribe((res) => logger.log(res));
    this.cultivatorGlobalDeveloperMetadataValue$.subscribe((res) =>
      logger.log(res)
    );

    this.doUpdateTransaction$.subscribe(() => {
      this.triggerTransactionRefresh$.next();
    });

    this.doAppendTransaction$.subscribe(() => {
      this.triggerTransactionRefresh$.next();
    });

    this.doAddTransactionHeader$.subscribe(() => {
      this.triggerTransactionRefresh$.next();
    });

    this.doUpdateGlobalMetadata$.subscribe(() => {
      this.triggerFullRefresh$.next();
    });

    this.doDeleteGlobalMetadata$.subscribe(() => {
      this.triggerFullRefresh$.next();
    });
  }

  public updateTransactionsRow(row: number, transaction: any) {
    console.log(transaction);
    this.onUpdateTransaction$.next({ row, transaction });
  }

  public addTransactionRow(transaction: any, rowNum?: number) {
    this.onAppendTransactions$.next({ transactions: [transaction], rowNum });
  }

  public addTransactionRows(transactions: any[], rowNum?: number) {
    this.onAppendTransactions$.next({ transactions, rowNum });
  }

  public addNotesHeader() {
    this.onAddTransactionHeader$.next({ header: NOTES_HEADER });
  }

  public updateGlobalMetadata(metadata: Partial<CultivatorMetadata>) {
    this.onUpdateGlobalMetadata$.next(metadata);
  }

  deleteMetadata() {
    this.onDeleteGlobalMetadata$.next();
  }
}
