import { Injectable } from '@angular/core';
import {
  combineLatest,
  catchError,
  filter,
  first,
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
  concatMap,
  Observable,
  EMPTY,
  debounceTime,
  timer,
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleSheetsClientService } from './google-sheets-client.service';
import { convertTableToDictArray, normalizeHeader } from '../utils/table-utils';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';
import { refreshMap, pauseWhen } from '../utils/refresh-operator';
import { LogService } from './log.service';
import { NOTES_HEADER } from './features.service';
import { CultivatorMetadata } from '../types/cultivator-metadata';

/** Discriminated union of all write operations. */
type WriteOperation =
  | { type: 'updateTransaction'; row: number; transaction: any }
  | { type: 'appendTransactions'; transactions: any[]; rowNum?: number }
  | { type: 'addTransactionHeader'; header: string | number }
  | { type: 'updateGlobalMetadata'; metadata: Partial<CultivatorMetadata> }
  | { type: 'deleteGlobalMetadata' };

/** Tracks which kinds of refresh are needed after a batch of writes. */
type RefreshType = 'transaction' | 'full';

/** Maximum number of retry attempts for a failed write. */
const WRITE_RETRY_COUNT = 3;

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsService {
  private static readonly METADATA_KEY = 'cultivator';

  // --- Write queue ---

  private readonly writeQueue$ = new Subject<WriteOperation>();

  /**
   * Tracks whether writes are currently in-flight.
   * Used to suppress polling and debounce refreshes.
   */
  private readonly _isWriting$ = new BehaviorSubject<boolean>(false);

  /**
   * Accumulates which refresh types are needed during a write batch.
   * Reset when the debounced refresh fires.
   */
  private pendingRefreshTypes = new Set<RefreshType>();

  // --- Triggers ---

  private triggerTransactionRefresh$ = new Subject<void>();
  private triggerFullRefresh$ = new Subject<void>();

  private _isOnline = new BehaviorSubject<boolean>(true);

  // --- Derived streams ---

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
        metadataArr?.find(
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly transactionSheetTitle$ = this.transactionsSheetInfo$.pipe(
    map((info) => info!.properties.title as string)
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
        pauseWhen(this._isWriting$.asObservable()),
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly categoryValuesRes$ = this.categorySheetInfo$.pipe(
    withLatestFrom(this.spreadsheetId$),
    switchMap(([info, id]) =>
      this.googleClient.getSpreadsheetValues(id!, info!.properties.title)
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly transactionHeaders$ = this.transactionValuesRes$.pipe(
    map((res) => res.values[0] as (string | number)[]),
    shareReplay({ bufferSize: 1, refCount: true })
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

  public readonly transactionData$ = combineLatest([
    this.transactionHeaders$,
    this.transactionRows$,
  ]).pipe(map(([headers, rows]) => convertTableToDictArray(headers, rows)));

  public readonly categoryData$ = combineLatest([
    this.categoryHeaders$,
    this.categoryRows$,
  ]).pipe(map(([headers, rows]) => convertTableToDictArray(headers, rows)));

  // --- Write queue processing ---

  /**
   * Executes a single write operation, returning the appropriate refresh type.
   * Uses `withLatestFrom` to grab current headers/title/id at execution time.
   */
  private executeWrite(op: WriteOperation): Observable<RefreshType> {
    switch (op.type) {
      case 'updateTransaction':
        return combineLatest([
          this.transactionHeaders$,
          this.transactionSheetTitle$,
          this.spreadsheetId$,
        ]).pipe(
          first(),
          switchMap(([headers, title, id]) => {
            const data = headers.map(
              (h) => op.transaction[normalizeHeader(h)]
            );
            return this.googleClient.updateRow(id!, title, op.row, data);
          }),
          map(() => 'transaction' as RefreshType)
        );

      case 'appendTransactions':
        return combineLatest([
          this.transactionHeaders$,
          this.transactionSheetTitle$,
          this.spreadsheetId$,
        ]).pipe(
          first(),
          switchMap(([headers, title, id]) => {
            const data = op.transactions.map((t) =>
              headers.map((h) => t[normalizeHeader(h)])
            );
            // Append after rowNum if provided, otherwise append to the top of the sheet after the headers.
            return this.googleClient.appendRows(
              id!,
              title,
              op.rowNum ?? 3,
              data
            );
          }),
          map(() => 'transaction' as RefreshType)
        );

      case 'addTransactionHeader':
        return combineLatest([
          this.transactionHeaders$,
          this.transactionSheetTitle$,
          this.spreadsheetId$,
        ]).pipe(
          first(),
          switchMap(([existingHeaders, title, id]) => {
            const headerAlreadyExists = existingHeaders.some(
              (existingHeader) =>
                existingHeader.toString().toLowerCase() ===
                op.header.toString().toLowerCase()
            );
            if (headerAlreadyExists) {
              return of(null);
            }
            const updatedHeaders = [...existingHeaders, op.header];
            return this.googleClient.updateRow(id!, title, 1, updatedHeaders);
          }),
          map(() => 'transaction' as RefreshType)
        );

      case 'updateGlobalMetadata':
        return combineLatest([
          this.cultivatorGlobalDeveloperMetadataValue$,
          this.spreadsheetId$,
        ]).pipe(
          first(),
          switchMap(([existingMetadata, spreadsheetId]) => {
            if (!existingMetadata) {
              return this.googleClient.addGlobalMetadata(
                spreadsheetId!,
                GoogleSheetsService.METADATA_KEY,
                JSON.stringify(op.metadata),
                'DOCUMENT'
              );
            } else {
              const updatedMetadata = { ...existingMetadata, ...op.metadata };
              return this.googleClient.updateGlobalMetadata(
                spreadsheetId!,
                GoogleSheetsService.METADATA_KEY,
                JSON.stringify(updatedMetadata),
                'DOCUMENT'
              );
            }
          }),
          map(() => 'full' as RefreshType)
        );

      case 'deleteGlobalMetadata':
        return this.spreadsheetId$.pipe(
          first(),
          switchMap((spreadsheetId) =>
            this.googleClient.deleteGlobalMetadata(
              spreadsheetId!,
              GoogleSheetsService.METADATA_KEY
            )
          ),
          map(() => 'full' as RefreshType)
        );
    }
  }

  constructor(
    private googleClient: GoogleSheetsClientService,
    private settings: SettingsService,
    private auth: GoogleAuthService,
    private snackbar: MatSnackBar,
    logger: LogService
  ) {
    // --- Logging subscriptions ---
    this.allSheetsResponse$.subscribe((res) => logger.log(res));
    this.transactionsSheetInfo$.subscribe((res) => logger.log(res));
    this.transactionValuesRes$.subscribe((res) => logger.log(res));
    this.transactionData$.subscribe((res) => logger.log(res));
    this.categorySheetInfo$.subscribe((res) => logger.log(res));
    this.categoryValuesRes$.subscribe((res) => logger.log(res));
    this.categoryData$.subscribe((res) => logger.log(res));
    this.cultivatorGlobalDeveloperMetadataValue$.subscribe((res) =>
      logger.log(res)
    );

    // --- Serialized write queue ---
    this.writeQueue$
      .pipe(
        concatMap((op) => {
          this._isWriting$.next(true);
          return this.executeWrite(op).pipe(
            retry({
              count: WRITE_RETRY_COUNT,
              delay: (error, retryCount) => {
                const delayMs = Math.min(
                  Math.pow(2, retryCount) * 1000,
                  8000
                );
                logger.log(
                  `Write retry ${retryCount}/${WRITE_RETRY_COUNT} for ${op.type}, waiting ${delayMs}ms`
                );
                return timer(delayMs);
              },
            }),
            tap({
              next: (refreshType) => {
                this.pendingRefreshTypes.add(refreshType);
              },
              error: (err) => {
                logger.error(`Write failed after ${WRITE_RETRY_COUNT} retries: ${op.type}`);
                logger.error(err);
                this.snackbar.open(
                  'Failed to save changes. Please refresh and try again.',
                  'Dismiss',
                  { duration: 10_000 }
                );
              },
            }),
            // Catch errors so the concatMap chain doesn't break.
            // Failed writes should not block subsequent queued writes.
            catchError(() => EMPTY)
          );
        })
      )
      .subscribe({
        next: () => {
          // After each write completes, check if the queue has drained.
          // We do this by briefly marking isWriting as false, then the
          // debounced refresh subscription will fire if no more writes arrive.
          this._isWriting$.next(false);
        },
      });

    // --- Debounced refresh after queue drains ---
    this._isWriting$
      .pipe(
        // Debounce to wait for the queue to truly drain.
        // If another write arrives within 300ms, the refresh is delayed.
        debounceTime(300),
        filter((isWriting) => !isWriting),
        // Only fire if there are actually pending refreshes.
        filter(() => this.pendingRefreshTypes.size > 0)
      )
      .subscribe(() => {
        const types = new Set(this.pendingRefreshTypes);
        this.pendingRefreshTypes.clear();

        if (types.has('full')) {
          this.triggerFullRefresh$.next();
        } else if (types.has('transaction')) {
          this.triggerTransactionRefresh$.next();
        }
      });
  }

  // --- Public API (unchanged signatures) ---

  public updateTransactionsRow(row: number, transaction: any) {
    console.log(transaction);
    this.writeQueue$.next({ type: 'updateTransaction', row, transaction });
  }

  public addTransactionRow(transaction: any, rowNum?: number) {
    this.writeQueue$.next({
      type: 'appendTransactions',
      transactions: [transaction],
      rowNum,
    });
  }

  public addTransactionRows(transactions: any[], rowNum?: number) {
    this.writeQueue$.next({
      type: 'appendTransactions',
      transactions,
      rowNum,
    });
  }

  public addNotesHeader() {
    this.writeQueue$.next({
      type: 'addTransactionHeader',
      header: NOTES_HEADER,
    });
  }

  public updateGlobalMetadata(metadata: Partial<CultivatorMetadata>) {
    this.writeQueue$.next({ type: 'updateGlobalMetadata', metadata });
  }

  deleteMetadata() {
    this.writeQueue$.next({ type: 'deleteGlobalMetadata' });
  }
}
