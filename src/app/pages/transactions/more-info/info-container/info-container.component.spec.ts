import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { InfoContainerComponent } from './info-container.component';
import { TransactionsService } from 'src/app/services/transactions.service';
import { FeaturesService } from 'src/app/services/features.service';

describe('InfoContainerComponent', () => {
  let component: InfoContainerComponent;
  let fixture: ComponentFixture<InfoContainerComponent>;
  let mockTransactionsService: any;
  let mockActivatedRoute: any;
  let mockFeaturesService: any;

  beforeEach(() => {
    mockTransactionsService = {
      transactions$: of([]),
    };
    mockActivatedRoute = {
      parent: {
        paramMap: of(convertToParamMap({ id: 'tx-1' })),
      },
    };
    mockFeaturesService = {
      notesEnabled$: of(true),
      splitEnabled$: of(true),
    };

    TestBed.configureTestingModule({
      declarations: [InfoContainerComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FeaturesService, useValue: mockFeaturesService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(InfoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
