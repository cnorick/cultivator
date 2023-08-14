import { Injectable } from '@angular/core';
import { BehaviorSubject, map, skip } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthState } from '../types/auth-state';
import { LocalStorageService } from './local-storage.service';
import { LogService } from './log.service';

export interface GoogleToken {
  accessToken: string;
  expiresIn: number; // seconds
}

interface StoredGoogleToken {
  accessToken: string;
  expirationTime: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private static readonly TOKEN_STORAGE_KEY = 'google_access_token';
  private static readonly EXISTING_USER_STORAGE_KEY = 'has_logged_in_before';

  private readonly token$ = new BehaviorSubject<StoredGoogleToken | undefined>(
    undefined
  );

  private timeoutId?: number = undefined;

  /**
   * Emits the access token if its valid, undefined otherwise.
   */
  public readonly accessToken$ = this.token$.pipe(
    map((token) =>
      token && Date.now() >= token.expirationTime.getTime()
        ? undefined
        : token?.accessToken
    )
  );

  public readonly loggedIn$ = this.token$.pipe(
    map(
      (token) =>
        !!token?.accessToken && Date.now() < token.expirationTime.getTime()
    )
  );

  private _existingUser: boolean;
  public get existingUser(): boolean {
    return this._existingUser;
  }

  private _setToken(token?: StoredGoogleToken) {
    this.token$.next(token);
    window.clearTimeout(this.timeoutId);

    if (token) {
      this.timeoutId = window.setTimeout(() => {
        this._setToken(undefined);
      }, token.expirationTime.getTime() - Date.now() - 10_000); // Trigger re-auth 10 seconds before the token expires
    }
  }

  constructor(
    private localStorage: LocalStorageService,
    private logger: LogService
  ) {
    this.token$.pipe(skip(1)).subscribe((token) => {
      if (!token) {
        this.reauthenticate();
      }
    });

    const tokenString = this.localStorage.getItem(
      GoogleAuthService.TOKEN_STORAGE_KEY
    );

    this._existingUser =
      this.localStorage.getItem(GoogleAuthService.EXISTING_USER_STORAGE_KEY) ===
      'true';

    if (tokenString) {
      const storedToken: StoredGoogleToken = JSON.parse(tokenString);
      storedToken.expirationTime = new Date(
        storedToken.expirationTime as unknown as string
      );
      this._setToken(storedToken);
    }
  }

  public setToken(newToken: GoogleToken) {
    if (!newToken.accessToken || typeof newToken.accessToken != 'string') {
      this.logger.error('Access token is not defined');
      this.logger.error(newToken);
      throw new Error('Access token is not defined');
    }

    if (
      !newToken.expiresIn ||
      typeof newToken.expiresIn != 'number' ||
      Number.isNaN(newToken.expiresIn)
    ) {
      this.logger.error('ExpiresIn is not defined');
      this.logger.error(newToken);
      throw new Error('ExpiresIn is not defined');
    }

    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + newToken.expiresIn);

    const storedToken = { accessToken: newToken.accessToken, expirationTime };
    this.localStorage.setItem(
      GoogleAuthService.TOKEN_STORAGE_KEY,
      JSON.stringify(storedToken)
    );

    this.localStorage.setItem(
      GoogleAuthService.EXISTING_USER_STORAGE_KEY,
      'true'
    );
    this._existingUser = true;

    this._setToken(storedToken);
  }

  public createAuthUrl(state?: AuthState) {
    const scopes = ['https://www.googleapis.com/auth/drive.file'];
    const CLIENT_ID = environment.GoogleClient.ClientId;

    const CALLBACK_URL = `${window.location.protocol}//${window.location.host}/oauth2callback`;
    const PROMPT = '';

    return `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes.join(
      ' '
    )}&include_granted_scopes=true&response_type=token&state=${JSON.stringify(
      state
    )}&redirect_uri=${CALLBACK_URL}&client_id=${CLIENT_ID}&prompt=${PROMPT}`;
  }

  public clearToken() {
    this.token$.next(undefined);
    this.localStorage.removeItem(GoogleAuthService.TOKEN_STORAGE_KEY);
  }

  public reauthenticate(state?: AuthState) {
    const defaultState: AuthState = {
      route: location.pathname + location.search,
    };
    const calculatedState = { ...state, ...defaultState };
    (window.location as any) = this.createAuthUrl(calculatedState);
  }
}
