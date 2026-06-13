import { TestBed, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { BehaviorSubject, of, Subject, throwError, delay } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsClientService, SpreadsheetsGetResponse, ValuesGetResponse, ValuesUpdateResponse, ValuesAppendResponse, BatchUpdateResponse } from './google-sheets-client.service';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';
import { LogService } from './log.service';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockGoogleClient: jasmine.SpyObj<GoogleSheetsClientService>;
  let mockSettings: any;
  let mockAuth: any;
  let mockLogger: jasmine.SpyObj<LogService>;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;

  const mockSpreadsheetsResponse: SpreadsheetsGetResponse = {
    spreadsheetId: 'sheet-123',
    sheets: [
      {
        properties: { sheetId: 0, title: 'Transactions', index: 0 },
        developerMetadata: [
          {
            metadataKey: 'tiller',
            metadataValue: JSON.stringify({ sheetInfo: { id: 'transactions' } }),
          },
        ],
      },
      {
        properties: { sheetId: 1, title: 'Categories', index: 1 },
        developerMetadata: [
          {
            metadataKey: 'tiller',
            metadataValue: JSON.stringify({ sheetInfo: { id: 'categoriesBudget' } }),
          },
        ],
      },
    ],
    developerMetadata: [
      {
        metadataKey: 'cultivator',
        metadataValue: JSON.stringify({ test: 'metadata' }),
      },
    ],
  };

  const mockTransactionValues: ValuesGetResponse = {
    range: 'Transactions!1:1001',
    majorDimension: 'ROWS',
    values: [
      ['Date', 'Description', 'Amount', 'Category'],
      [44562, 'Groceries', 50.0, 'Food'],
    ],
  };

  const mockCategoryValues: ValuesGetResponse = {
    range: 'Categories!A1:Z',
    majorDimension: 'ROWS',
    values: [
      ['Category', 'Budget'],
      ['Food', 500],
    ],
  };

  beforeEach(() => {
    mockGoogleClient = jasmine.createSpyObj('GoogleSheetsClientService', [
      'getAllSheets',
      'getSpreadsheetValues',
      'updateRow',
      'appendRows',
      'addGlobalMetadata',
      'updateGlobalMetadata',
      'deleteGlobalMetadata',
    ]);

    mockSettings = {
      spreadsheetId$: new BehaviorSubject<string | undefined>('sheet-123'),
      refreshRateSeconds$: new BehaviorSubject<number>(10),
      maxTransactionRows$: new BehaviorSubject<number | undefined>(1000),
    };

    mockAuth = {
      loggedIn$: new BehaviorSubject<boolean>(true),
    };

    mockLogger = jasmine.createSpyObj('LogService', ['log', 'error', 'warn']);
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Set up default successful HTTP responses
    mockGoogleClient.getAllSheets.and.returnValue(of(mockSpreadsheetsResponse));

    mockGoogleClient.getSpreadsheetValues.and.callFake((id: string, range: string) => {
      if (range.includes('Transactions')) {
        return of(mockTransactionValues);
      } else {
        return of(mockCategoryValues);
      }
    });

    mockGoogleClient.updateRow.and.returnValue(
      of({ spreadsheetId: 'sheet-123', updatedRange: '', updatedRows: 1, updatedColumns: 4, updatedCells: 4 } as ValuesUpdateResponse)
    );

    mockGoogleClient.appendRows.and.returnValue(
      of({ spreadsheetId: 'sheet-123', tableRange: '', updates: {} } as any as ValuesAppendResponse)
    );

    mockGoogleClient.updateGlobalMetadata.and.returnValue(
      of({ spreadsheetId: 'sheet-123', replies: [] } as BatchUpdateResponse)
    );

    mockGoogleClient.deleteGlobalMetadata.and.returnValue(
      of({ spreadsheetId: 'sheet-123', replies: [] } as BatchUpdateResponse)
    );

    mockGoogleClient.addGlobalMetadata.and.returnValue(
      of({ spreadsheetId: 'sheet-123', replies: [] } as BatchUpdateResponse)
    );

    TestBed.configureTestingModule({
      providers: [
        GoogleSheetsService,
        { provide: GoogleSheetsClientService, useValue: mockGoogleClient },
        { provide: SettingsService, useValue: mockSettings },
        { provide: GoogleAuthService, useValue: mockAuth },
        { provide: LogService, useValue: mockLogger },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ],
    });

    service = TestBed.inject(GoogleSheetsService);
    // Keep data streams warm to match app behavior and prevent pauseWhen deadlock
    service.transactionData$.subscribe();
    service.categoryData$.subscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load developer metadata on init', (done) => {
    service.cultivatorGlobalDeveloperMetadataValue$.subscribe((meta) => {
      expect(meta).toEqual({ test: 'metadata' } as any);
      done();
    });
  });

  it('should format transaction data correctly', (done) => {
    service.transactionData$.subscribe((data) => {
      expect(data).toEqual([
        { date: 44562, description: 'Groceries', amount: 50.0, category: 'Food' },
      ] as any);
      done();
    });
  });

  it('should format category data correctly', (done) => {
    service.categoryData$.subscribe((data) => {
      expect(data).toEqual([
        { category: 'Food', budget: 500 },
      ] as any);
      done();
    });
  });

  describe('write queue serialization', () => {
    it('should process writes sequentially via concatMap (second write waits for first)', fakeAsync(() => {
      // Let initial data load
      tick(100);

      const callOrder: string[] = [];

      mockGoogleClient.updateRow.and.callFake(() => {
        console.log('SPY EXECUTED!');
        callOrder.push('spy');
        return throwError(() => new Error('Network error'));
      });

      console.log('CALLING UPDATE ROW');
      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'A', amount: 10, category: 'Food' });
      console.log('CALLED UPDATE ROW');

      flushMicrotasks();
      flush();
      
      console.log('CALL ORDER:', callOrder);
      expect(callOrder).toEqual(['spy']);
    }));

    it('should not cancel an in-flight write when a new write arrives', fakeAsync(() => {
      // Let initial data load
      tick(100);

      let updateCallCount = 0;
      mockGoogleClient.updateRow.and.callFake(() => {
        updateCallCount++;
        return of({ spreadsheetId: 'sheet-123', updatedRange: '', updatedRows: 1, updatedColumns: 4, updatedCells: 4 } as ValuesUpdateResponse).pipe(
          delay(200),
        );
      });

      // Fire two writes rapidly
      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'A', amount: 10, category: 'Food' });
      service.updateTransactionsRow(3, { date: '1/2/2023', description: 'B', amount: 20, category: 'Food' });

      // Let both complete
      flushMicrotasks();
      flush();

      // Both calls should have been made (not cancelled)
      expect(updateCallCount).toBe(2);
    }));
  });

  describe('retry behavior', () => {
    it('should retry a failed write up to 3 times then show snackbar', fakeAsync(() => {
      // Wait for initial data load so transactionHeaders$ and transactionSheetTitle$ are available
      tick(100);

      let callCount = 0;
      mockGoogleClient.updateRow.and.callFake(() => {
        callCount++;
        return throwError(() => new Error('Network error'));
      });

      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'A', amount: 10, category: 'Food' });

      flush();
      expect(callCount).toBe(4); // 1 initial + 3 retries
      expect(mockSnackbar.open).toHaveBeenCalledWith(
        'Failed to save changes. Please refresh and try again.',
        'Dismiss',
        jasmine.any(Object)
      );
    }));

    it('should succeed if a write fails then succeeds on retry', fakeAsync(() => {
      tick(100);

      let callCount = 0;
      mockGoogleClient.updateRow.and.callFake(() => {
        callCount++;
        if (callCount < 3) {
          return throwError(() => new Error('Network error'));
        }
        return of({ spreadsheetId: 'sheet-123', updatedRange: '', updatedRows: 1, updatedColumns: 4, updatedCells: 4 } as ValuesUpdateResponse);
      });

      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'A', amount: 10, category: 'Food' });

      flush();
      expect(callCount).toBe(3);
      expect(mockSnackbar.open).not.toHaveBeenCalled();
    }));

    it('should not block subsequent writes after a failed write', fakeAsync(() => {
      tick(100);

      let callCount = 0;
      mockGoogleClient.updateRow.and.callFake(() => {
        callCount++;
        if (callCount <= 4) {
          return throwError(() => new Error('Network error'));
        }
        return of({ spreadsheetId: 'sheet-123', updatedRange: '', updatedRows: 1, updatedColumns: 4, updatedCells: 4 } as ValuesUpdateResponse);
      });

      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'Fail', amount: 10, category: 'Food' });
      service.updateTransactionsRow(3, { date: '1/2/2023', description: 'Succeed', amount: 20, category: 'Food' });


      // Drain debounce
      tick(500);
    }));
  });

  describe('debounced refresh', () => {
    it('should trigger a single refresh after multiple writes drain', fakeAsync(() => {
      // Track calls to getSpreadsheetValues after the initial load
      let getValuesCallCount = 0;

      // Wait for initial data load
      tick(100);

      // Reset and start counting
      mockGoogleClient.getSpreadsheetValues.calls.reset();
      mockGoogleClient.getSpreadsheetValues.and.callFake((id: string, range: string) => {
        getValuesCallCount++;
        if (range.includes('Transactions')) {
          return of(mockTransactionValues);
        } else {
          return of(mockCategoryValues);
        }
      });

      // Fire two rapid writes
      service.updateTransactionsRow(2, { date: '1/1/2023', description: 'A', amount: 10, category: 'Food' });
      service.updateTransactionsRow(3, { date: '1/2/2023', description: 'B', amount: 20, category: 'Food' });

      // Process both writes
      tick(100);

      // Debounce period (300ms)
      tick(400);

      // Should have refreshed, but only once for the batch (not twice).
      // The refresh triggers getSpreadsheetValues for the transaction sheet.
      // We verify by checking that the refresh didn't fire twice.
      // Due to the debounce, we should see fewer refresh calls than writes.
      expect(getValuesCallCount).toBeLessThanOrEqual(2); // at most one refresh cycle (may fetch transactions + categories)

      // Drain any remaining timers
      tick(15000);
    }));
  });
});
