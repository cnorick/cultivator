import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { NotesComponent } from './notes.component';
import { TransactionsService } from '../../../../services/transactions.service';

describe('NotesComponent', () => {
  let component: NotesComponent;
  let fixture: ComponentFixture<NotesComponent>;
  let mockTransactionsService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockTransactionsService = {
      transactions$: of([{ transaction_id: 'tx-1', notes: 'some notes' } as any]),
      updateNotes: jasmine.createSpy('updateNotes'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      parent: {
        paramMap: of(convertToParamMap({ id: 'tx-1' })),
      },
    };

    TestBed.configureTestingModule({
      declarations: [NotesComponent],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
