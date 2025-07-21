import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Category } from 'src/app/types/category';

@Component({
    selector: 'app-new-transfer',
    templateUrl: './new-transfer.component.html',
    styleUrls: ['./new-transfer.component.scss'],
    standalone: false
})
export class NewTransferComponent {
  newTransferForm = new FormGroup({
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    notes: new FormControl(''),
    date: new FormControl<Date | null>(new Date()),
    from: new FormControl<Category | null>(null, [
      Validators.required,
      (control) => {
        const value = control.value;
        console.log(value)
        if (!value || !value.category) {
          return { invalidCategory: true };
        }
        return null;
      }
    ]),
    to: new FormControl<Category | null>(null, [
      Validators.required,
      (control) => {
        const value = control.value;
        if (!value || !value.category) {
          return { invalidCategory: true };
        }
        return null;
      }
    ]),
  });

  get amount() {
    return this.newTransferForm.get('amount');
  }

  constructor(
    private transactionsService: TransactionsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  onSubmit() {
    if (!this.newTransferForm.valid) {
      return;
    }

    const formVal = this.newTransferForm.value;
    const newId = this.transactionsService.createTransfer({
      amount: formVal.amount!,
      from: formVal.from!,
      to: formVal.to!,
      date: formVal.date ?? undefined,
      notes: formVal.notes ?? undefined,
    });

    this.router.navigate(['../'], { relativeTo: this.activatedRoute, replaceUrl: true });
  }
}
