import { Component } from '@angular/core';
import { MatChipSelectionChange } from '@angular/material/chips';
import {
  TransactionFilter,
  TransactionsService,
} from 'src/app/services/transactions.service';
import { Transaction } from 'src/app/types/transaction';

const sameMonthAndYear = (d1?: Date, d2?: Date) =>
  !!d1 &&
  !!d2 &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

interface Filter {
  name: string;
  filter: TransactionFilter;
  onChange?: (selected: boolean, allFilters: Filter[]) => void;
  selected?: boolean;
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
      filter: (t: Transaction) => sameMonthAndYear(t.date, new Date()),
      onChange: function (selected, filters) {
        this.selected = selected;
        if (selected) {
          const lastMonth = filters.find((f) => f.name === 'Last Month');
          if (lastMonth) {
            lastMonth.selected = false;
            lastMonth.onChange?.(false, filters);
          }
        }
      },
    },
    {
      name: 'Last Month',
      filter: (t: Transaction) => {
        const lastMonth = new Date();
        lastMonth.setDate(0);
        return sameMonthAndYear(t.date, lastMonth);
      },
      onChange: function (selected, filters) {
        this.selected = selected;
        if (selected) {
          const thisMonth = filters.find((f) => f.name === 'This Month');
          if (thisMonth) {
            thisMonth.selected = false;
            thisMonth.onChange?.(false, filters);
          }
        }
      },
    },
  ];

  onFilterChange(
    event: MatChipSelectionChange,
    filter: Filter,
    allFilters: Filter[]
  ) {
    filter.selected = event.selected;
    filter.onChange?.(event.selected, allFilters);

    this.transactionsService.setFilters(
      allFilters.filter((f) => f.selected).map((f) => f.filter)
    );
  }
}
