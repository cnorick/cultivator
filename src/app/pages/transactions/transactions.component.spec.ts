import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TransactionsComponent } from './transactions.component';
import { TransactionsService } from 'src/app/services/transactions.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { FeaturesService } from 'src/app/services/features.service';
import { MatChipsModule } from '@angular/material/chips';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let mockTransactionsService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockLocalStorageService: any;
  let mockFeaturesService: any;

  beforeEach(async () => {
    mockTransactionsService = {
      shownTransactions$: of([]),
      getSearch: jasmine.createSpy('getSearch').and.returnValue('test-search'),
      setSearch: jasmine.createSpy('setSearch'),
      setFilters: jasmine.createSpy('setFilters'),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    mockActivatedRoute = {
      queryParamMap: of({
        get: () => null,
      }),
      snapshot: {
        queryParamMap: {
          get: () => null,
        },
      },
    };

    mockLocalStorageService = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
    };

    mockFeaturesService = {
      manualTransactionsEnabled$: of(true),
      transfersEnabled$: of(true),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatChipsModule],
      declarations: [TransactionsComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: FeaturesService, useValue: mockFeaturesService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchControl with value from TransactionsService.getSearch()', () => {
    expect(mockTransactionsService.getSearch).toHaveBeenCalled();
    expect(component.searchControl.value).toBe('test-search');
  });

  it('should initialize searchExpanded to true if there is a search term', () => {
    expect(component.searchExpanded).toBeTrue();
  });

  it('should update TransactionsService search term on searchControl changes', () => {
    component.searchControl.setValue('new-query');
    expect(mockTransactionsService.setSearch).toHaveBeenCalledWith('new-query');
  });
});
