import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Category } from 'src/app/types/category';
import { Transaction } from 'src/app/types/transaction';

@Component({
  selector: 'app-category-selector-page',
  templateUrl: './category-selector-page.component.html',
  styleUrls: ['./category-selector-page.component.scss'],
})
export class CategorySelectorPageComponent {
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

  onSelectedCategoryChange(category: Category, transaction: Transaction) {
    this.transactionsService.updateCategory(transaction, category);
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
