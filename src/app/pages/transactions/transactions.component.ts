import { Component } from '@angular/core';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.less'],
})
export class TransactionsComponent {
  constructor(private transactionsService: TransactionsService) {}

  transactions$ = this.transactionsService.shownTransactions$;
}
