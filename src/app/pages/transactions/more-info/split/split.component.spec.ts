import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { SplitComponent } from './split.component';
import { TransactionsService } from 'src/app/services/transactions.service';

describe('SplitComponent', () => {
  let component: SplitComponent;
  let fixture: ComponentFixture<SplitComponent>;
  let mockTransactionsService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockTransactionsService = {
      transactions$: of([
        { transaction_id: 'tx-1', amount: -100, category: 'Food' }
      ]),
      splitTransaction: jasmine.createSpy('splitTransaction'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      parent: {
        paramMap: of(convertToParamMap({ id: 'tx-1' })),
      },
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SplitComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(SplitComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
