import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { featureGuard } from './feature.guard';
import { FeaturesService } from '../services/features.service';

describe('featureGuard', () => {
  let mockFeaturesService: any;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;
  let notesEnabled$: BehaviorSubject<boolean | null>;
  let splitEnabled$: BehaviorSubject<boolean | null>;
  let transfersEnabled$: BehaviorSubject<boolean | null>;

  beforeEach(() => {
    notesEnabled$ = new BehaviorSubject<boolean | null>(null);
    splitEnabled$ = new BehaviorSubject<boolean | null>(null);
    transfersEnabled$ = new BehaviorSubject<boolean | null>(null);

    mockFeaturesService = {
      notesEnabled$: notesEnabled$.asObservable(),
      splitEnabled$: splitEnabled$.asObservable(),
      transfersEnabled$: transfersEnabled$.asObservable(),
    };
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: FeaturesService, useValue: mockFeaturesService },
        { provide: MatSnackBar, useValue: mockSnackbar },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow navigation if notes feature is enabled', (done) => {
    notesEnabled$.next(true);

    TestBed.runInInjectionContext(() => {
      const guardFn = featureGuard('notes');
      guardFn().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  it('should block navigation, open snackbar, and redirect to settings if feature is disabled', (done) => {
    notesEnabled$.next(false);
    const mockUrlTree = {} as UrlTree;
    mockRouter.createUrlTree.and.returnValue(mockUrlTree);

    TestBed.runInInjectionContext(() => {
      const guardFn = featureGuard('notes');
      guardFn().subscribe((result) => {
        expect(mockSnackbar.open).toHaveBeenCalledWith('Notes not enabled.');
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/settings']);
        expect(result).toBe(mockUrlTree);
        done();
      });
    });
  });
});
