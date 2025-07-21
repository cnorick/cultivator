import { inject, NgModule } from '@angular/core';
import {
  Routes,
  RouterModule,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { map } from 'rxjs';
import { featureGuard } from 'src/app/guards/feature.guard';
import { TransactionsService } from 'src/app/services/transactions.service';
import { CategorySelectorPageComponent } from './more-info/category-selector-page/category-selector-page.component';
import { InfoContainerComponent } from './more-info/info-container/info-container.component';
import { MoreInfoComponent } from './more-info/more-info.component';
import { NotesComponent } from './more-info/notes/notes.component';
import { TransactionsComponent } from './transactions.component';
import { NewTransactionComponent } from './new-transaction/new-transaction.component';
import { SplitComponent } from './more-info/split/split.component';
import { NewTransferComponent } from './new-transfer/new-transfer.component';

const getTransactionTitleResolver =
  (append?: string) =>
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const transactionsService = inject(TransactionsService);

    return transactionsService.transactions$.pipe(
      map((transactions) => {
        const transaction = transactions?.find(
          (t) => t.transaction_id === route.parent!.paramMap.get('id')
        );
        const description =
          transaction?.description ??
          `Transaction ${route.parent!.paramMap.get('id')}`;
        return `${description}${append ? ' | ' + append : ''}`;
      })
    );
  };

const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    title: 'Transactions',
  },
  {
    path: 'new',
    component: NewTransactionComponent,
    data: {
      breadcrumb: 'New',
    },
    title: 'New Transaction',
  },
  {
    path: 'transfer',
    component: NewTransferComponent,
    data: {
      breadcrumb: 'New Transfer',
    },
    title: 'New Transfer',
    canActivate: [featureGuard('transfer')],
  },
  {
    path: ':id',
    component: MoreInfoComponent,
    data: {
      breadcrumb: '',
    },
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        component: InfoContainerComponent,
        title: getTransactionTitleResolver(),
        data: { gaTitle: 'Transaction' },
      },
      {
        path: 'category',
        data: { breadcrumb: 'Category', gaTitle: 'Transaction Category' },
        component: CategorySelectorPageComponent,
        title: getTransactionTitleResolver('Category'),
      },
      {
        data: { breadcrumb: 'Notes', gaTitle: 'Transaction Notes' },
        path: 'notes',
        component: NotesComponent,
        title: getTransactionTitleResolver('Notes'),
        canActivate: [featureGuard('notes')],
      },
      {
        data: { breadcrumb: 'Split', gaTitle: 'Transaction Split' },
        path: 'split',
        component: SplitComponent,
        title: getTransactionTitleResolver('Split'),
        canActivate: [featureGuard('split')],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsRoutingModule {}
