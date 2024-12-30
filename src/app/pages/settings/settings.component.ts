import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { FeaturesService } from 'src/app/services/features.service';
import { GoogleSheetsService } from 'src/app/services/google-sheets.service';
import { LogService } from 'src/app/services/log.service';
import { SettingsService } from 'src/app/services/settings.service';

interface Feature {
  name: string;
  description: string;
  enabled$: Observable<boolean | null>;
  enable?: () => void;
  disable?: () => void;
}

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  settingsForm = new FormGroup({
    spreadsheetId: new FormControl({ value: '', disabled: false }),
    dateFormat: new FormControl(''),
    initialTransactionsLoaded: new FormControl<number>(0),
  });

  readonly notesEnabled$ = this.featuresService.notesEnabled$;
  readonly manualTransactionsEnabled$ =
    this.featuresService.manualTransactionsEnabled$;
  readonly showFeatures$ = this.settingsService.spreadsheetId$.pipe(
    map((spreadsheetId) => !!spreadsheetId)
  );

  readonly features: Feature[] = [
    {
      name: 'Notes',
      description:
        'Adds a notes header to your transaction sheet so that you can take notes in this app',
      enabled$: this.notesEnabled$,
      enable: () => this.onEnableNotes(),
    },
    {
      name: 'Manual Transactions',
      description:
        'Adds the ability to create manual transactions from this app',
      enabled$: this.manualTransactionsEnabled$,
      enable: () => this.onEnableManualTransactions(),
      disable: () => this.onDisableManualTransactions(),
    },
  ];

  constructor(
    private settingsService: SettingsService,
    activatedRoute: ActivatedRoute,
    router: Router,
    private featuresService: FeaturesService
  ) {
    settingsService.settings$
      .pipe(takeUntil(this.settingsForm.valueChanges))
      .subscribe((settings) =>
        this.settingsForm.setValue({
          spreadsheetId: settings.spreadsheetId ?? '',
          dateFormat: settings.dateFormat ?? '',
          initialTransactionsLoaded: settings.initialTransactionsLoaded ?? 0,
        })
      );

    this.settingsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings) => settingsService.updateSettings(settings as any));

    activatedRoute.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const docId = params.get('docId');
        if (docId) {
          this.settingsForm.patchValue({ spreadsheetId: docId });
          router.navigate([], {
            relativeTo: activatedRoute,
            queryParams: { docId: undefined },
            queryParamsHandling: 'merge',
          });
        }
      });
  }

  onEnableNotes() {
    this.featuresService.enableNotesFeature();
  }

  onEnableManualTransactions() {
    this.featuresService.enableManualTransactionsFeature();
  }

  onDisableManualTransactions() {
    this.featuresService.disableManualTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
