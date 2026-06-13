import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CategorySelectorComponent } from 'src/app/components/category-selector/category-selector.component';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Category } from 'src/app/types/category';
import { Transaction } from 'src/app/types/transaction';

@Component({
    selector: 'app-category-selector-page',
    templateUrl: './category-selector-page.component.html',
    styleUrls: ['./category-selector-page.component.scss'],
    standalone: false
})
export class CategorySelectorPageComponent implements AfterViewInit {
  private transactionsService = inject(TransactionsService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild(CategorySelectorComponent)
  categorySelector!: CategorySelectorComponent;

  ngAfterViewInit(): void {
    if (this.categorySelector) {
      this.categorySelector.focus();
    }
  }

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
