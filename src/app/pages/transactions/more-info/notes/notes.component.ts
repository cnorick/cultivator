import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Transaction } from 'src/app/types/transaction';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent {
  constructor(
    private transactionsService: TransactionsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  transaction$ = combineLatest([
    this.activatedRoute.parent!.paramMap,
    this.transactionsService.transactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );

  onNotesChange(event: Event, transaction: Transaction) {
    const notes = (event.target as any).value;
    this.transactionsService.updateNotes(transaction, notes);
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
