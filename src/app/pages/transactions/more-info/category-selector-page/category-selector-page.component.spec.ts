import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CategorySelectorPageComponent } from './category-selector-page.component';
import { TransactionsService } from '../../../../services/transactions.service';

describe('CategorySelectorPageComponent', () => {
  let component: CategorySelectorPageComponent;
  let fixture: ComponentFixture<CategorySelectorPageComponent>;
  let mockTransactionsService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockTransactionsService = {
      transactions$: of([{ transaction_id: 'tx-1', category: 'Food' } as any]),
      updateCategory: jasmine.createSpy('updateCategory'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      parent: {
        paramMap: of(convertToParamMap({ id: 'tx-1' })),
      },
    };

    TestBed.configureTestingModule({
      declarations: [CategorySelectorPageComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(CategorySelectorPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
