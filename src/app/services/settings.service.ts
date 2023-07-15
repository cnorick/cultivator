import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export interface Settings {
  spreadsheetUrl?: string;
  dateFormat?: string;
  initialTransactionsLoaded?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private static readonly SETTINGS_STORAGE_KEY = 'settings';

  private readonly defaults: Required<Settings> = {
    spreadsheetUrl: undefined!,
    dateFormat: undefined!,
    initialTransactionsLoaded: 20,
  };

  private readonly _settings$ = new BehaviorSubject<Settings>({});
  public readonly settings$ = this._settings$.asObservable();

  public readonly spreadsheetUrl$ = this._settings$.pipe(
    map((settings) => settings.spreadsheetUrl),
    distinctUntilChanged()
  );

  public readonly initialTransactionsLoaded$ = this._settings$.pipe(
    map(
      (settings) =>
        settings.initialTransactionsLoaded ??
        this.defaults.initialTransactionsLoaded!
    ),
    distinctUntilChanged()
  );

  constructor(localStorage: LocalStorageService) {
    const storedSettings: Settings = JSON.parse(
      localStorage.getItem(SettingsService.SETTINGS_STORAGE_KEY) ?? '{}'
    );

    const settings = { ...this.defaults, ...storedSettings };

    this._settings$.next(settings);

    this.settings$.subscribe((settings: Settings) =>
      localStorage.setItem(
        SettingsService.SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      )
    );
  }

  public updateSettings(newSettings: Settings) {
    this._settings$.next(newSettings);
  }
}
