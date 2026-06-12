import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { FeaturesService } from './features.service';
import { GoogleSheetsService } from './google-sheets.service';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let mockGoogleSheets: jasmine.SpyObj<GoogleSheetsService>;
  let transactionHeaders$: BehaviorSubject<any[]>;
  let cultivatorGlobalDeveloperMetadataValue$: BehaviorSubject<any>;

  beforeEach(() => {
    transactionHeaders$ = new BehaviorSubject<any[]>(['Date', 'Description', 'Amount']);
    cultivatorGlobalDeveloperMetadataValue$ = new BehaviorSubject<any>({
      manualTransactionsEnabled: false,
      splitEnabled: false,
      transfersEnabled: false,
    });

    mockGoogleSheets = jasmine.createSpyObj('GoogleSheetsService', [
      'addNotesHeader',
      'updateGlobalMetadata',
    ]);

    (mockGoogleSheets as any).transactionHeaders$ = transactionHeaders$.asObservable();
    (mockGoogleSheets as any).cultivatorGlobalDeveloperMetadataValue$ = cultivatorGlobalDeveloperMetadataValue$.asObservable();

    TestBed.configureTestingModule({
      providers: [
        FeaturesService,
        { provide: GoogleSheetsService, useValue: mockGoogleSheets },
      ],
    });
    service = TestBed.inject(FeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect if notes feature is enabled/disabled based on headers', (done) => {
    const expected = [false, true];
    let index = 0;
    service.notesEnabled$.subscribe((enabled) => {
      expect(enabled).toBe(expected[index]);
      index++;
      if (index === expected.length) {
        done();
      }
    });

    transactionHeaders$.next(['Date', 'Description', 'Amount', 'Notes']);
  });

  it('should detect if manual transactions is enabled/disabled based on metadata', (done) => {
    const expected = [false, true];
    let index = 0;
    service.manualTransactionsEnabled$.subscribe((enabled) => {
      if (enabled !== null) {
        expect(enabled).toBe(expected[index]);
        index++;
        if (index === expected.length) {
          done();
        }
      }
    });

    cultivatorGlobalDeveloperMetadataValue$.next({ manualTransactionsEnabled: true });
  });

  it('should call googleSheetsService to enable notes', () => {
    service.enableNotesFeature();
    expect(mockGoogleSheets.addNotesHeader).toHaveBeenCalled();
  });

  it('should call googleSheetsService to toggle split feature', () => {
    service.enableSplitFeature();
    expect(mockGoogleSheets.updateGlobalMetadata).toHaveBeenCalledWith({ splitEnabled: true });

    service.disableSplitFeature();
    expect(mockGoogleSheets.updateGlobalMetadata).toHaveBeenCalledWith({ splitEnabled: false });
  });
});
