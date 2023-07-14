import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Category } from 'src/app/types/category';
import { Transaction } from 'src/app/types/transaction';

@Component({
  selector: 'app-more-info',
  templateUrl: './more-info.component.html',
  styleUrls: ['./more-info.component.less'],
})
export class MoreInfoComponent {
  constructor(
    private transactionsService: TransactionsService,
    private activatedRoute: ActivatedRoute
  ) {}

  transaction$ = combineLatest([
    this.activatedRoute.paramMap,
    this.transactionsService.shownTransactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );

  onSelectedCategoryChange(category: Category, transaction: Transaction) {
    this.transactionsService.updateCategory(transaction, category);
  }
}
