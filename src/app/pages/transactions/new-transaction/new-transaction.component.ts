import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Category } from 'src/app/types/category';

@Component({
    selector: 'app-new-transaction',
    templateUrl: './new-transaction.component.html',
    styleUrls: ['./new-transaction.component.scss'],
    standalone: false
})
export class NewTransactionComponent {
  newTransactionForm = new FormGroup({
    title: new FormControl('', Validators.required),
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    type: new FormControl<'expense' | 'income'>('expense', Validators.required),
    date: new FormControl<Date | null>(new Date()),
    category: new FormControl<Category | null>(null),
    notes: new FormControl(''),
  });

  get amount() {
    return this.newTransactionForm.get('amount');
  }

  constructor(
    private transactionsService: TransactionsService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.newTransactionForm.valid) {
      return;
    }

    const formVal = this.newTransactionForm.value;
    const newId = this.transactionsService.addManualTransaction({
      amount: formVal.amount! * (formVal.type! === 'expense' ? -1 : 1),
      category: formVal.category?.category,
      date: formVal.date ?? undefined,
      date_added: new Date(),
      description: formVal.title ?? undefined,
      full_description: formVal.title + ' - Added manually from Cultivator',
      notes: formVal.notes ?? undefined,
      account: 'manual',
      institution: 'Manual Transaction',
    });

    this.router.navigate(['transactions', newId]);
  }
}
