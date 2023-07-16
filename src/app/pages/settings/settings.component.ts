import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
})
export class SettingsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  settingsForm = new FormGroup({
    spreadsheetId: new FormControl(''),
    dateFormat: new FormControl(''),
    initialTransactionsLoaded: new FormControl<number>(0),
  });

  constructor(
    settingsService: SettingsService,
    activatedRoute: ActivatedRoute,
    router: Router
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
        }
        router.navigate([], {
          relativeTo: activatedRoute,
          queryParams: { docId: undefined },
          queryParamsHandling: 'merge',
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
