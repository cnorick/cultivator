import { Component, Input } from '@angular/core';
import { CATEGORY_LOADING_VAL } from 'src/app/types/category';
import { Transaction } from 'src/app/types/transaction';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    standalone: false
})
export class TransactionComponent {
  readonly CATEGORY_LOADING_VAL = CATEGORY_LOADING_VAL;
  @Input() transaction!: Transaction;
}
