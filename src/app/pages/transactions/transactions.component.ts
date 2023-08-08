import { Component } from '@angular/core';
import { MatChipSelectionChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
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
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent {
  constructor(
    private transactionsService: TransactionsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    activatedRoute.queryParamMap.pipe(take(1)).subscribe((queryParams) => {
      this.toggleOffAllFilters();
      const filterNames = queryParams.get('filters')?.split(',') ?? [];
      for (let filterName of filterNames) {
        const filter = this.allFilters.find(
          (f) => this.convertFilterNameToParam(f.name) === filterName
        );

        if (filter) {
          this.toggleFilter(filter, true);
        }
      }
    });
  }

  transactions$ = this.transactionsService.shownTransactions$;

  readonly allFilters: Filter[] = [
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

  private convertFilterNameToParam(name: string) {
    return name.replace(/\s/, '-').toLowerCase();
  }

  private toggleOffAllFilters() {
    for (let filter of this.allFilters) {
      this.toggleFilter(filter, false);
    }
  }

  private toggleFilter(filter: Filter, state: boolean) {
    filter.selected = state;
    filter.onChange?.(state, this.allFilters);

    const selectedFilters = this.allFilters.filter((f) => f.selected);
    this.transactionsService.setFilters(selectedFilters.map((f) => f.filter));

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        filters: selectedFilters
          .map((f) => this.convertFilterNameToParam(f.name))
          .join(','),
      },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
      replaceUrl: true,
    });
  }

  onFilterChange(
    event: MatChipSelectionChange,
    filter: Filter,
    allFilters: Filter[]
  ) {
    this.toggleFilter(filter, event.selected);
  }
}
