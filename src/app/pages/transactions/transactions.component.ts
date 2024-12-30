import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipSelectionChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { FeaturesService } from 'src/app/services/features.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
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
    standalone: false
})
export class TransactionsComponent {
  private static readonly FILTER_STORAGE_KEY = 'transaction_filters';

  searchControl = new FormControl<string>('');

  constructor(
    private transactionsService: TransactionsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorage: LocalStorageService,
    private featuresService: FeaturesService
  ) {
    activatedRoute.queryParamMap.pipe(take(1)).subscribe((queryParams) => {
      // Check the query params first and use those filters if there are some. Otherwise, use the stored ones.
      let filterNames = queryParams.get('filters')?.split(',') ?? [];
      if (!filterNames.length) {
        filterNames =
          this.localStorage
            .getItem(TransactionsComponent.FILTER_STORAGE_KEY)
            ?.split(',') ?? [];
      }

      this.toggleOffAllFilters();
      for (let filterName of filterNames) {
        const filter = this.allFilters.find(
          (f) => this.convertFilterNameToParam(f.name) === filterName
        );

        if (filter) {
          this.toggleFilter(filter, true);
        }
      }

      this.updateQueryParams();
    });

    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.transactionsService.setSearch(searchTerm || '');
    });
  }

  transactions$ = this.transactionsService.shownTransactions$;
  manualTransactionsEnabled$ = this.featuresService.manualTransactionsEnabled$;

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
    const filtersParamString = selectedFilters
      .map((f) => this.convertFilterNameToParam(f.name))
      .join(',');

    this.transactionsService.setFilters(selectedFilters.map((f) => f.filter));
    this.localStorage.setItem(
      TransactionsComponent.FILTER_STORAGE_KEY,
      filtersParamString
    );
  }

  private updateQueryParams() {
    const selectedFilters = this.allFilters.filter((f) => f.selected);
    const filtersParamString = selectedFilters
      .map((f) => this.convertFilterNameToParam(f.name))
      .join(',');

    const exitingFilterQueryParam =
      this.activatedRoute.snapshot.queryParamMap.get('filters');

    if (exitingFilterQueryParam !== filtersParamString) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          filters: filtersParamString,
        },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
        replaceUrl: true,
      });
    }
  }

  onFilterChange(
    event: MatChipSelectionChange,
    filter: Filter,
    allFilters: Filter[]
  ) {
    this.toggleFilter(filter, event.selected);
    this.updateQueryParams();
  }
}
