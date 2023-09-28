import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Category } from 'src/app/types/category';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.scss'],
})
export class NewTransactionComponent {
  newTransactionForm = new FormGroup({
    title: new FormControl('', Validators.required),
    amount: new FormControl(null, Validators.required),
    date: new FormControl(new Date()),
    category: new FormControl<Category | null>(null),
    notes: new FormControl(''),
  });

  onSubmit() {
    console.log(this.newTransactionForm);
  }
}
