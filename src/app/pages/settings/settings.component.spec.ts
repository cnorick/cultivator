import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { SettingsService } from 'src/app/services/settings.service';
import { FeaturesService } from 'src/app/services/features.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockSettingsService: any;
  let mockFeaturesService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockSettingsService = {
      settings$: of({
        spreadsheetId: 'some-id',
        dateFormat: 'MM/dd/yyyy',
        initialTransactionsLoaded: 20,
        maxTransactionRows: 1000,
        refreshRateSeconds: 10,
      }),
      spreadsheetId$: of('some-id'),
      updateSettings: jasmine.createSpy('updateSettings'),
    };

    mockFeaturesService = {
      notesEnabled$: of(true),
      manualTransactionsEnabled$: of(true),
      splitEnabled$: of(true),
      transfersEnabled$: of(true),
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParamMap: of({
        get: () => null,
      }),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SettingsComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: FeaturesService, useValue: mockFeaturesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
