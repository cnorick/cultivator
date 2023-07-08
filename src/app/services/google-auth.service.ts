import { Injectable } from '@angular/core';
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

  private token?: StoredGoogleToken;

  /**
   * Returns the access token if its valid, undefined otherwise.
   */
  public get accessToken(): string | undefined {
    if (this.token && Date.now() >= this.token.expirationTime.getTime()) {
      this.clearToken();
    }
    return this.token?.accessToken;
  }

  constructor(private localStorage: LocalStorageService) {
    const tokenString = this.localStorage.getItem(
      GoogleAuthService.STORAGE_KEY
    );
    if (tokenString) {
      this.token = JSON.parse(tokenString);
      this.token!.expirationTime = new Date(
        this.token?.expirationTime as unknown as string
      );
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

    this.token = { accessToken: newToken.accessToken, expirationTime };
    this.localStorage.setItem(
      GoogleAuthService.STORAGE_KEY,
      JSON.stringify(this.token)
    );
  }

  public createAuthUrl(state?: AuthState) {
    const scopes = ['https://www.googleapis.com/auth/drive.file'];
    const CLIENT_ID = environment.GoogleClient.ClientId;

    const CALLBACK_URL = `${window.location.protocol}//${window.location.host}/oauth2callback`;

    return `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes.join(
      ' '
    )}&include_granted_scopes=true&response_type=token&state=${JSON.stringify(
      state
    )}&redirect_uri=${CALLBACK_URL}&client_id=${CLIENT_ID}`;
  }

  public clearToken() {
    this.token = undefined;
    this.localStorage.removeItem(GoogleAuthService.STORAGE_KEY);
  }
}
