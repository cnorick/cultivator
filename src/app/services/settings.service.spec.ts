import { TestBed } from '@angular/core/testing';
import { SettingsService, Settings } from './settings.service';
import { LocalStorageService } from './local-storage.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem']);
    mockLocalStorage.getItem.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: LocalStorageService, useValue: mockLocalStorage },
      ],
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default settings when localStorage is empty', (done) => {
    service.settings$.subscribe((settings) => {
      expect(settings.initialTransactionsLoaded).toBe(20);
      expect(settings.refreshRateSeconds).toBe(10);
      expect(settings.maxTransactionRows).toBe(1000);
      done();
    });
  });

  it('should load settings from localStorage on init', () => {
    mockLocalStorage.getItem.and.returnValue(
      JSON.stringify({
        spreadsheetId: 'some-sheet-id',
        refreshRateSeconds: 30,
      })
    );

    // Reinitialize to trigger constructor load
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: LocalStorageService, useValue: mockLocalStorage },
      ],
    });
    const newService = TestBed.inject(SettingsService);
    newService.settings$.subscribe((settings) => {
      expect(settings.spreadsheetId).toBe('some-sheet-id');
      expect(settings.refreshRateSeconds).toBe(30);
      expect(settings.initialTransactionsLoaded).toBe(20); // fallback to default
    });
  });

  it('should save settings to localStorage when updated', () => {
    const newSettings: Settings = {
      spreadsheetId: 'new-id',
      refreshRateSeconds: 50,
    };
    service.updateSettings(newSettings);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      jasmine.stringMatching('"spreadsheetId":"new-id"')
    );
  });
});
