import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';

import { GoogleSheetsClientService } from './google-sheets-client.service';
import { GoogleAuthService } from './google-auth.service';
import { LogService } from './log.service';

describe('GoogleSheetsClientService', () => {
  let service: GoogleSheetsClientService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;
  let mockLogService: jasmine.SpyObj<LogService>;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;
  let accessToken$: BehaviorSubject<string | undefined>;

  beforeEach(() => {
    accessToken$ = new BehaviorSubject<string | undefined>('fake-token');
    mockAuthService = {
      accessToken$: accessToken$.asObservable(),
    };

    mockLogService = jasmine.createSpyObj('LogService', ['log', 'error', 'warn']);
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        GoogleSheetsClientService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GoogleAuthService, useValue: mockAuthService },
        { provide: LogService, useValue: mockLogService },
        { provide: MatSnackBar, useValue: mockSnackbar },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(GoogleSheetsClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should include Authorization header with bearer token in GET request', () => {
    service.getAllSheets('sheet-id-123').subscribe();

    const req = httpMock.expectOne('https://sheets.googleapis.com/v4/spreadsheets/sheet-id-123');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should handle 401 unauthorized errors', () => {
    mockSnackbar.open.and.returnValue({
      onAction: () => of(null),
    } as any);

    service.getAllSheets('sheet-id-123').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('https://sheets.googleapis.com/v4/spreadsheets/sheet-id-123');
    req.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockSnackbar.open).toHaveBeenCalledWith('You are logged out.', 'Log back in', jasmine.any(Object));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should extract spreadsheet ID and sheet ID from URL', () => {
    const url = 'https://docs.google.com/spreadsheets/d/1A2B3C4D5E/edit#gid=9876';
    expect(service.getSpreadsheetIdFromUrl(url)).toBe('1A2B3C4D5E');
    expect(service.getSheetIdFromUrl(url)).toBe('9876');
  });

  it('should use the freshest token at request time (reactive token)', () => {
    // Update token after service creation
    accessToken$.next('updated-token');

    service.getAllSheets('sheet-id-456').subscribe();

    const req = httpMock.expectOne('https://sheets.googleapis.com/v4/spreadsheets/sheet-id-456');
    expect(req.request.headers.get('Authorization')).toBe('Bearer updated-token');
    req.flush({});
  });

  it('should error if access token is undefined', () => {
    accessToken$.next(undefined);

    let errorThrown = false;
    service.getAllSheets('sheet-id-789').subscribe({
      error: (err) => {
        errorThrown = true;
        expect(err.message).toBe('Not logged into Google.');
      },
    });

    expect(errorThrown).toBe(true);
  });

  it('should make PUT requests for updateRow', () => {
    service.updateRow('sheet-123', 'Transactions', 2, ['val1', 'val2']).subscribe();

    const req = httpMock.expectOne(
      'https://sheets.googleapis.com/v4/spreadsheets/sheet-123/values/Transactions!2:2?valueInputOption=RAW'
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.body).toEqual({ values: [['val1', 'val2']] });
    req.flush({});
  });

  it('should make POST requests for appendRows', () => {
    service.appendRows('sheet-123', 'Transactions', 3, [['v1', 'v2']]).subscribe();

    const req = httpMock.expectOne(
      'https://sheets.googleapis.com/v4/spreadsheets/sheet-123/values/Transactions!A3:A3:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ values: [['v1', 'v2']] });
    req.flush({});
  });
});
