import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MoreInfoComponent } from './more-info.component';
import { TransactionsService } from 'src/app/services/transactions.service';

describe('MoreInfoComponent', () => {
  let component: MoreInfoComponent;
  let fixture: ComponentFixture<MoreInfoComponent>;
  let mockTransactionsService: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockTransactionsService = {
      transactions$: of([]),
    };
    mockActivatedRoute = {
      paramMap: of(convertToParamMap({ id: 'tx-1' })),
    };

    TestBed.configureTestingModule({
      declarations: [MoreInfoComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(MoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
