import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { GoogleAuthService } from './services/google-auth.service';
import { BreadcrumbsService } from './services/breadcrumbs.service';
import { GoogleSheetsService } from './services/google-sheets.service';

describe('AppComponent', () => {
  let mockAuthService: any;
  let mockBreadcrumbsService: any;
  let mockGoogleSheetsService: any;

  beforeEach(() => {
    mockAuthService = {
      loggedIn$: of(true),
    };
    mockBreadcrumbsService = {
      breadcrumbs$: of([]),
    };
    mockGoogleSheetsService = {
      isOnline$: of(true),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: GoogleAuthService, useValue: mockAuthService },
        { provide: BreadcrumbsService, useValue: mockBreadcrumbsService },
        { provide: GoogleSheetsService, useValue: mockGoogleSheetsService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
