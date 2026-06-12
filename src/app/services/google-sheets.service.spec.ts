import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsClientService } from './google-sheets-client.service';
import { SettingsService } from './settings.service';
import { GoogleAuthService } from './google-auth.service';
import { LogService } from './log.service';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockGoogleClient: jasmine.SpyObj<GoogleSheetsClientService>;
  let mockSettings: any;
  let mockAuth: any;
  let mockLogger: jasmine.SpyObj<LogService>;

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

    // Set up default successful HTTP responses
    mockGoogleClient.getAllSheets.and.returnValue(
      of({
        developerMetadata: [
          {
            metadataKey: 'cultivator',
            metadataValue: JSON.stringify({ test: 'metadata' }),
          },
        ],
        sheets: [
          {
            properties: { title: 'Transactions' },
            developerMetadata: [
              {
                metadataKey: 'tiller',
                metadataValue: JSON.stringify({ sheetInfo: { id: 'transactions' } }),
              },
            ],
          },
          {
            properties: { title: 'Categories' },
            developerMetadata: [
              {
                metadataKey: 'tiller',
                metadataValue: JSON.stringify({ sheetInfo: { id: 'categoriesBudget' } }),
              },
            ],
          },
        ],
      })
    );

    mockGoogleClient.getSpreadsheetValues.and.callFake((id, title) => {
      if (title.includes('Transactions')) {
        return of({
          values: [
            ['Date', 'Description', 'Amount', 'Category'],
            [44562, 'Groceries', 50.0, 'Food'],
          ],
        });
      } else {
        return of({
          values: [
            ['Category', 'Budget'],
            ['Food', 500],
          ],
        });
      }
    });

    TestBed.configureTestingModule({
      providers: [
        GoogleSheetsService,
        { provide: GoogleSheetsClientService, useValue: mockGoogleClient },
        { provide: SettingsService, useValue: mockSettings },
        { provide: GoogleAuthService, useValue: mockAuth },
        { provide: LogService, useValue: mockLogger },
      ],
    });

    service = TestBed.inject(GoogleSheetsService);
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
});
