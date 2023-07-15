import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
    spreadsheetUrl: new FormControl(''),
    dateFormat: new FormControl(''),
    initialTransactionsLoaded: new FormControl<number>(0),
  });

  constructor(settingsService: SettingsService) {
    settingsService.settings$
      .pipe(takeUntil(this.settingsForm.valueChanges))
      .subscribe((settings) =>
        this.settingsForm.setValue({
          spreadsheetUrl: settings.spreadsheetUrl ?? '',
          dateFormat: settings.dateFormat ?? '',
          initialTransactionsLoaded: settings.initialTransactionsLoaded ?? 0,
        })
      );

    this.settingsForm.valueChanges
      .pipe(takeUntil(this.destroy$))

      .subscribe((settings) => settingsService.updateSettings(settings as any));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
