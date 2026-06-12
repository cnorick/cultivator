import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { TransactionsService, TransactionSplit } from './transactions.service';
import { GoogleSheetsService } from './google-sheets.service';
import { SettingsService } from './settings.service';
import { Transaction } from '../types/transaction';
import { Category } from '../types/category';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockGoogleSheets: jasmine.SpyObj<GoogleSheetsService>;
  let mockSettings: any;
  let transactionData$: BehaviorSubject<any[]>;

  const mockRawTransactions = [
    {
      account: 'Checking',
      amount: -15.5,
      category: 'Food',
      description: 'Coffee Shop',
      full_description: 'Coffee Shop Local LLC',
      notes: 'Coffee with team',
      transaction_id: 'tx-1',
      date: 44562, // Jan 1, 2022
    },
    {
      account: 'Savings',
      amount: 100.0,
      category: 'Income',
      description: 'Refund',
      full_description: 'Refund from online retailer',
      notes: '',
      transaction_id: 'tx-2',
      date: 44563, // Jan 2, 2022
    },
  ];

  beforeEach(() => {
    transactionData$ = new BehaviorSubject<any[]>(mockRawTransactions);
    mockGoogleSheets = jasmine.createSpyObj('GoogleSheetsService', [
      'updateTransactionsRow',
      'addTransactionRow',
      'addTransactionRows',
    ]);
    // Inject the observable property
    (mockGoogleSheets as any).transactionData$ = transactionData$.asObservable();

    mockSettings = {
      initialTransactionsLoaded$: new BehaviorSubject<number>(20),
    };

    TestBed.configureTestingModule({
      providers: [
        TransactionsService,
        { provide: GoogleSheetsService, useValue: mockGoogleSheets },
        { provide: SettingsService, useValue: mockSettings },
      ],
    });
    service = TestBed.inject(TransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse and map raw transactions correctly', (done) => {
    service.transactions$.subscribe((transactions) => {
      expect(transactions.length).toBe(2);
      expect(transactions[0].description).toBe('Coffee Shop');
      expect(transactions[0].sheetsRow).toBe(2); // 0 + 2
      done();
    });
  });

  it('should search and filter transactions by term', (done) => {
    service.setSearch('refund');
    service.shownTransactions$.subscribe((transactions) => {
      // It starts with null emission, then yields result
      if (transactions) {
        expect(transactions.length).toBe(1);
        expect(transactions[0].description).toBe('Refund');
        done();
      }
    });
  });

  it('should filter transactions by custom filter function', (done) => {
    service.setFilters([(t) => (t.amount ?? 0) > 0]);
    service.shownTransactions$.subscribe((transactions) => {
      if (transactions) {
        expect(transactions.length).toBe(1);
        expect(transactions[0].description).toBe('Refund');
        done();
      }
    });
  });

  it('should update category of a transaction', () => {
    const tx: Transaction = {
      account: 'Checking',
      amount: -15.5,
      category: 'Food',
      description: 'Coffee',
      sheetsRow: 2,
      original: mockRawTransactions[0],
    };
    const cat: Category = { category: 'Dining Out', group: 'Living', type: 'Expense' };

    service.updateCategory(tx, cat);

    expect(mockGoogleSheets.updateTransactionsRow).toHaveBeenCalledWith(2, {
      ...mockRawTransactions[0],
      category: 'Dining Out',
    });
  });

  it('should split a transaction and append others', () => {
    const tx: Transaction = {
      account: 'Checking',
      amount: 100.0,
      category: 'Uncategorized',
      sheetsRow: 5,
      original: { account: 'Checking', amount: 100.0, category: 'Uncategorized', date: 44562 },
    };

    const splits: TransactionSplit[] = [
      { category: 'Rent', amount: 80 },
      { category: 'Utilities', amount: 20 },
    ];

    service.splitTransaction(tx, splits);

    expect(mockGoogleSheets.updateTransactionsRow).toHaveBeenCalledWith(5, jasmine.objectContaining({
      category: 'Rent',
      amount: 80,
    }));

    expect(mockGoogleSheets.addTransactionRows).toHaveBeenCalledWith(
      jasmine.any(Array),
      6 // sheetsRow + 1
    );
  });
});
