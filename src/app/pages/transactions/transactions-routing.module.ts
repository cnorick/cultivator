import { inject, NgModule } from '@angular/core';
import {
  Routes,
  RouterModule,
  ResolveFn,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';
import { Transaction } from 'src/app/types/transaction';
import { CategorySelectorPageComponent } from './more-info/category-selector-page/category-selector-page.component';
import { InfoContainerComponent } from './more-info/info-container/info-container.component';
import { MoreInfoComponent } from './more-info/more-info.component';
import { TransactionsComponent } from './transactions.component';

const transactionResolver: ResolveFn<Transaction | undefined> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const transactionsService = inject(TransactionsService);

  return transactionsService.transactions$.pipe(
    map((transactions) =>
      transactions?.find((t) => t.transaction_id === route.paramMap.get('id'))
    )
  );
};

const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    title: 'Transactions',
  },
  {
    path: ':id',
    title: 'Transaction',
    component: MoreInfoComponent,
    data: {
      breadcrumb: '',
    },
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        component: InfoContainerComponent,
      },
      {
        path: 'category',
        component: CategorySelectorPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsRoutingModule {}
