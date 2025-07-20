import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export interface Settings {
  spreadsheetId?: string;
  dateFormat?: string;
  initialTransactionsLoaded?: number;
  refreshRateSeconds?: number;
  maxTransactionRows?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private static readonly SETTINGS_STORAGE_KEY = 'settings';

  private readonly defaults: Required<Settings> = {
    spreadsheetId: undefined!,
    dateFormat: undefined!,
    initialTransactionsLoaded: 20,
    refreshRateSeconds: 10,
    maxTransactionRows: 1000,
  };

  private readonly _settings$ = new BehaviorSubject<Settings>({});
  public readonly settings$ = this._settings$.asObservable();

  public readonly spreadsheetId$ = this._settings$.pipe(
    map((settings) => settings.spreadsheetId),
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

  public readonly refreshRateSeconds$ = this._settings$.pipe(
    map(
      (settings) =>
        settings.refreshRateSeconds ?? this.defaults.refreshRateSeconds!
    ),
    distinctUntilChanged()
  );

  public readonly maxTransactionRows$ = this._settings$.pipe(
    map((settings) => settings.maxTransactionRows ?? this.defaults.maxTransactionRows!),
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
