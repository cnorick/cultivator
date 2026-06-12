import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { GoogleAuthService } from '../services/google-auth.service';

describe('authGuard', () => {
  let mockAuthService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let loggedInSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    loggedInSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      loggedIn$: loggedInSubject.asObservable(),
      existingUser: false,
      reauthenticate: jasmine.createSpy('reauthenticate'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: GoogleAuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should return true if user is logged in', (done) => {
    loggedInSubject.next(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      if (result instanceof BehaviorSubject || typeof result === 'object') {
        result.subscribe((val) => {
          expect(val).toBeTrue();
          done();
        });
      }
    });
  });

  it('should redirect to /about if user is not logged in and not an existing user', (done) => {
    loggedInSubject.next(false);
    mockAuthService.existingUser = false;
    const mockUrlTree = {} as UrlTree;
    mockRouter.createUrlTree.and.returnValue(mockUrlTree);

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      result.subscribe((val) => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/about']);
        expect(val).toBe(mockUrlTree);
        done();
      });
    });
  });

  it('should call reauthenticate if user is not logged in but is an existing user', (done) => {
    loggedInSubject.next(false);
    mockAuthService.existingUser = true;
    mockAuthService.reauthenticate.and.returnValue(of(false));

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      result.subscribe(() => {
        expect(mockAuthService.reauthenticate).toHaveBeenCalled();
        done();
      });
    });
  });
});
