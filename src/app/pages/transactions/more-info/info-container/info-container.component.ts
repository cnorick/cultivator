import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { FeaturesService } from 'src/app/services/features.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { CATEGORY_LOADING_VAL } from 'src/app/types/category';

@Component({
    selector: 'app-info-container',
    templateUrl: './info-container.component.html',
    styleUrls: ['./info-container.component.scss'],
    standalone: false
})
export class InfoContainerComponent {
  readonly CATEGORY_LOADING_VAL = CATEGORY_LOADING_VAL;
  constructor(
    private transactionsService: TransactionsService,
    private activatedRoute: ActivatedRoute,
    private featuresService: FeaturesService
  ) {}

  transaction$ = combineLatest([
    this.activatedRoute.parent!.paramMap,
    this.transactionsService.transactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );

  readonly notesEnabled$ = this.featuresService.notesEnabled$;
}
