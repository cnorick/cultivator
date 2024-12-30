import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';
import { CATEGORY_LOADING_VAL } from 'src/app/types/category';
import { Transaction } from 'src/app/types/transaction';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    standalone: false
})
export class NotesComponent implements AfterViewInit {
  @ViewChild('input') inputEl!: ElementRef<HTMLTextAreaElement>;
  constructor(
    private transactionsService: TransactionsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.focus();
  }

  transaction$ = combineLatest([
    this.activatedRoute.parent!.paramMap,
    this.transactionsService.transactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );

  notesString$ = this.transaction$.pipe(
    map((t) => t?.notes),
    map((notes) => {
      if (notes === CATEGORY_LOADING_VAL) {
        return '...Loading';
      } else return notes ?? '';
    })
  );

  focus(): void {
    this.inputEl.nativeElement.focus({ preventScroll: true });
    this.cdr.detectChanges();
  }

  onNotesChange(event: Event, transaction: Transaction) {
    const notes = (event.target as any).value;
    this.transactionsService.updateNotes(transaction, notes);
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
