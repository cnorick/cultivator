import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinct, map } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export interface Settings {
  spreadsheetUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private static readonly SETTINGS_STORAGE_KEY = 'settings';

  private readonly settings$ = new BehaviorSubject<Settings>({});

  public readonly spreadsheetUrl$ = this.settings$.pipe(
    map((settings) => settings.spreadsheetUrl),
    distinct()
  );

  constructor(localStorage: LocalStorageService) {
    const storedSettings: Settings = JSON.parse(
      localStorage.getItem(SettingsService.SETTINGS_STORAGE_KEY) ?? '{}'
    );

    this.settings$.next(storedSettings);

    combineLatest({ spreadsheetUrl: this.spreadsheetUrl$ }).subscribe(
      (settings: Settings) =>
        localStorage.setItem(
          SettingsService.SETTINGS_STORAGE_KEY,
          JSON.stringify(settings)
        )
    );
  }

  public updateSettings(newSettings: Settings) {
    this.settings$.next(newSettings);
  }
}
