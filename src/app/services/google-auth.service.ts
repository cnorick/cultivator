import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthState } from '../types/auth-state';
import { LocalStorageService } from './local-storage.service';

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
  private static readonly STORAGE_KEY = 'google_access_token';

  private readonly token$ = new BehaviorSubject<StoredGoogleToken | undefined>(
    undefined
  );

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

  constructor(private localStorage: LocalStorageService) {
    const tokenString = this.localStorage.getItem(
      GoogleAuthService.STORAGE_KEY
    );

    if (tokenString) {
      const storedToken: StoredGoogleToken = JSON.parse(tokenString);
      storedToken.expirationTime = new Date(
        storedToken.expirationTime as unknown as string
      );
      this.token$.next(storedToken);
    }
  }

  public setToken(newToken: GoogleToken) {
    if (!newToken.accessToken || typeof newToken.accessToken != 'string') {
      throw new Error('Access token is not defined');
    }

    if (
      !newToken.expiresIn ||
      typeof newToken.expiresIn != 'number' ||
      Number.isNaN(newToken.expiresIn)
    ) {
      throw new Error('ExpiresIn is not defined');
    }

    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + newToken.expiresIn);

    const storedToken = { accessToken: newToken.accessToken, expirationTime };
    this.localStorage.setItem(
      GoogleAuthService.STORAGE_KEY,
      JSON.stringify(storedToken)
    );

    this.token$.next(storedToken);
  }

  public createAuthUrl(state?: AuthState) {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ];
    const CLIENT_ID = environment.GoogleClient.ClientId;

    const CALLBACK_URL = `${window.location.protocol}//${window.location.host}/oauth2callback`;
    const PROMPT = 'none';

    return `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes.join(
      ' '
    )}&include_granted_scopes=true&response_type=token&state=${JSON.stringify(
      state
    )}&redirect_uri=${CALLBACK_URL}&client_id=${CLIENT_ID}&prompt=${PROMPT}`;
  }

  public clearToken() {
    this.token$.next(undefined);
    this.localStorage.removeItem(GoogleAuthService.STORAGE_KEY);
  }
}
