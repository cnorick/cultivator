import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { googleSheetIsSetGuard } from './google-sheet-is-set.guard';
import { SettingsService } from '../services/settings.service';

describe('googleSheetIsSetGuard', () => {
  let mockSettingsService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
  let spreadsheetId$: BehaviorSubject<string | undefined>;

  beforeEach(() => {
    spreadsheetId$ = new BehaviorSubject<string | undefined>(undefined);
    mockSettingsService = {
      spreadsheetId$: spreadsheetId$.asObservable(),
    };
    mockRouter = jasmine.createSpyObj('Router', ['parseUrl']);
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ],
    });
  });

  it('should allow navigation if spreadsheetId is set', (done) => {
    spreadsheetId$.next('some-spreadsheet-id');

    TestBed.runInInjectionContext(() => {
      googleSheetIsSetGuard().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  it('should block navigation, open snackbar, and redirect to settings if spreadsheetId is empty', (done) => {
    spreadsheetId$.next(undefined);
    const mockUrlTree = {} as UrlTree;
    mockRouter.parseUrl.and.returnValue(mockUrlTree);

    TestBed.runInInjectionContext(() => {
      googleSheetIsSetGuard().subscribe((result) => {
        expect(mockSnackbar.open).toHaveBeenCalledWith('Select your Tiller sheet before you can see transactions.');
        expect(mockRouter.parseUrl).toHaveBeenCalledWith('/settings');
        expect(result).toBe(mockUrlTree);
        done();
      });
    });
  });
});
