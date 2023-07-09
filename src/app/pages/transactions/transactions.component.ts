import { Component } from '@angular/core';
import {
  TransactionFilter,
  TransactionsService,
} from 'src/app/services/transactions.service';
import { Transaction } from 'src/app/types/transaction';

interface Filter {
  name: string;
  filter: TransactionFilter;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.less'],
})
export class TransactionsComponent {
  constructor(private transactionsService: TransactionsService) {}

  transactions$ = this.transactionsService.shownTransactions$;

  allFilters: Filter[] = [
    {
      name: 'Uncategorized',
      filter: (t: Transaction) => !t.category,
    },
    {
      name: 'This Month',
      filter: (t: Transaction) => t.date?.getMonth() == new Date().getMonth(),
    },
  ];

  updateFilters(event: any) {
    this.transactionsService.setFilters(
      event.value.map((f: Filter) => f.filter)
    );
  }
}
