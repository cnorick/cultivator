import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { NewTransactionComponent } from './new-transaction.component';
import { TransactionsService } from 'src/app/services/transactions.service';

import { MatRadioModule } from '@angular/material/radio';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NewTransactionComponent', () => {
  let component: NewTransactionComponent;
  let fixture: ComponentFixture<NewTransactionComponent>;
  let mockTransactionsService: any;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockTransactionsService = {
      addManualTransaction: jasmine.createSpy('addManualTransaction'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatRadioModule],
      declarations: [NewTransactionComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(NewTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
