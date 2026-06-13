import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
    selector: 'app-more-info',
    templateUrl: './more-info.component.html',
    styleUrls: ['./more-info.component.scss'],
    standalone: false
})
export class MoreInfoComponent {
  private transactionsService = inject(TransactionsService);
  private activatedRoute = inject(ActivatedRoute);


  transaction$ = combineLatest([
    this.activatedRoute.paramMap,
    this.transactionsService.transactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );
}
