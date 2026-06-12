import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GoogleAuthService, GoogleToken } from './google-auth.service';
import { LocalStorageService } from './local-storage.service';
import { LogService } from './log.service';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let httpMock: HttpTestingController;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;
  let mockLogService: jasmine.SpyObj<LogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem', 'removeItem']);
    mockLogService = jasmine.createSpyObj('LogService', ['log', 'error', 'warn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Prevent direct window navigation during reauthenticate calls
    spyOn(GoogleAuthService.prototype, 'reauthenticate');

    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: LogService, useValue: mockLogService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(GoogleAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate authentication URL correctly', () => {
    const url = service.createAuthUrl({ route: '/test-route' });
    expect(url).toContain('accounts.google.com/o/oauth2/v2/auth');
    expect(url).toContain('client_id=');
    expect(url).toContain('redirect_uri=');
  });

  it('should handle setting a token and updating loggedIn status', (done) => {
    const token: GoogleToken = {
      accessToken: 'test-access-token',
      expiresIn: 3600,
    };

    service.setToken(token);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'google_access_token',
      jasmine.stringMatching('"accessToken":"test-access-token"')
    );

    service.loggedIn$.subscribe((loggedIn) => {
      expect(loggedIn).toBeTrue();
      done();
    });
  });

  it('should clear token and navigate to about page on logout', () => {
    service.setToken({ accessToken: 'test-access-token', expiresIn: 3600 });
    service.logout();

    // Revoke token HTTP request
    const req = httpMock.expectOne((r) => r.url.includes('oauth2.googleapis.com/revoke'));
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('google_access_token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('has_logged_in_before');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/about']);
  });
});
