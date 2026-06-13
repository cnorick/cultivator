import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, skipWhile, take } from 'rxjs';
import {
  TransactionSplit,
  TransactionsService,
} from 'src/app/services/transactions.service';
import { Transaction } from 'src/app/types/transaction';
import { areFloatsEqual } from 'src/app/utils/float-utils';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html',
  styleUrl: './split.component.scss',
  standalone: false,
})
export class SplitComponent {
  private transactionsService = inject(TransactionsService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  readonly transaction$ = combineLatest([
    this.activatedRoute.parent!.paramMap,
    this.transactionsService.transactions$,
  ]).pipe(
    map(([paramMap, transactions]) =>
      transactions?.find((t) => t.transaction_id === paramMap.get('id'))
    )
  );

  readonly splitsForm = new FormGroup(
    {
      splits: new FormArray([]),
    },
    { validators: (...args) => this.splitsValidator(...args) }
  );

  transaction: Transaction | null = null;
  totalAmount = 0;
  amountPositive = true;

  get splits(): TransactionSplit[] {
    return this.splitsFormArray.controls.map((control) => control.value);
  }

  get splitsFormArray() {
    return this.splitsForm.get('splits') as FormArray;
  }

  constructor() {
    this.transaction$.pipe(skipWhile(t => !t), take(1)).subscribe((transaction) => {
      if (transaction) {
        this.transaction = transaction;
        this.totalAmount = Math.abs(transaction.amount ?? 0);
        this.amountPositive = (transaction.amount ?? 0) >= 0;
        const firstSplit = {
          category: transaction.category ?? '',
          amount: this.totalAmount,
        };
        this.splitsFormArray.push(
          new FormGroup({
            category: new FormControl(firstSplit.category),
            amount: new FormControl(firstSplit.amount),
          })
        );
      }
    });
  }

  addSplit() {
    const newSplit = {
      category: '',
      amount: this.toTwoDecimalPlaces(
        this.totalAmount - getSplitSum(this.splits)
      ),
    };

    this.splitsFormArray.push(
      new FormGroup({
        category: new FormControl(newSplit.category),
        amount: new FormControl(newSplit.amount),
      })
    );
  }

  removeSplit(index: number) {
    (this.splitsForm.get('splits') as FormArray)!.removeAt(index);
  }

  saveSplits() {
    console.log(this.splits);
    if (!this.areSplitsValid()) {
      console.log('Invalid splits');
      return;
    }

    const splitsWithSign = this.splits.map((s) => ({
      ...s,
      amount: this.amountPositive ? s.amount : -s.amount,
    }));

    this.transactionsService.splitTransaction(
      this.transaction!,
      splitsWithSign
    );

    this.router.navigate(['../'], { relativeTo: this.activatedRoute, replaceUrl: true });
  }

  private areSplitsValid() {
    return (
      areFloatsEqual(getSplitSum(this.splits), this.totalAmount) &&
      this.splits.every((s) => s.amount > 0)
    );
  }

  private toTwoDecimalPlaces(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  private splitsValidator(control: AbstractControl): ValidationErrors | null {
    const splits = (
      (control as FormGroup).get('splits') as FormArray
    ).controls.map((control) => control.value);

    const invalidSum = !areFloatsEqual(getSplitSum(splits), this.totalAmount);
    if (invalidSum) {
      return { invalidSum };
    }

    return null;
  }
}

function getSplitSum(splits: TransactionSplit[]) {
  return splits.reduce((acc, s) => acc + (s.amount ?? 0), 0);
}
