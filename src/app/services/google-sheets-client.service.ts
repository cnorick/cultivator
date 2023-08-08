import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsClientService {
  private readonly endpoint = 'https://sheets.googleapis.com';
  private readonly version = 'v4';
  private readonly baseUrl = `${this.endpoint}/${this.version}/spreadsheets`;

  private accessToken: string | undefined;

  constructor(
    private auth: GoogleAuthService,
    private http: HttpClient,
    private logger: LogService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
    this.auth.accessToken$.subscribe(
      (accessToken) => (this.accessToken = accessToken)
    );
  }

  private checkIfLoggedOut(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error?.status === 401) {
        this.logger.log('Logged out');
        const snack = this.snackbar.open('You are logged out.', 'Log back in', {
          duration: 25_000,
        });
        snack.onAction().subscribe(() => this.router.navigate(['/login']));
      }
    }
  }

  private get<T>(url: string) {
    if (!this.accessToken) {
      this.logger.error('Not logged into Google. Access Token is not defined');
      throw new Error('Not logged into Google.');
    }

    return this.http
      .get<T>(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .pipe(
        catchError((error) => {
          this.checkIfLoggedOut(error);
          this.logger.log(`Error making get request to ${url}`);
          this.logger.log(error);
          return throwError(() => error);
        })
      );
  }

  private put<T>(url: string, body: any) {
    if (!this.accessToken) {
      throw new Error('Not logged into Google.');
    }

    return this.http
      .put<T>(url, body, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .pipe(
        catchError((error) => {
          this.checkIfLoggedOut(error);
          this.logger.log(`Error making put request to ${url}`);
          this.logger.log(error);
          return throwError(() => error);
        })
      );
  }

  public getAllSheets(spreadsheetId: string) {
    return this.get<any>(`${this.baseUrl}/${spreadsheetId}`);
  }

  /**
   * https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
   */
  public getSpreadsheetValues(spreadsheetId: string, sheetTitle: string) {
    return this.get<any>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetTitle}?valueRenderOption=UNFORMATTED_VALUE`
    );
  }

  public getSpreadsheetIdFromUrl(url?: string) {
    return url?.match(
      /https:\/\/docs.google.com\/spreadsheets\/d\/([^\/]*)/
    )?.[1];
  }

  public getSheetIdFromUrl(url?: string) {
    return url?.match(/#gid=(\d)*/)?.[1];
  }

  /**
   *
   * @param spreadsheetId
   * @param sheetTitle
   * @param rowNum the 1-based row number, corresponding to the sheet row number
   * @param data
   * @returns
   */
  public updateRow(
    spreadsheetId: string,
    sheetTitle: string,
    rowNum: number,
    data: any[]
  ) {
    const formattedRange = `${sheetTitle}!${rowNum}:${rowNum}`;
    return this.put(
      `${this.baseUrl}/${spreadsheetId}/values/${formattedRange}?valueInputOption=RAW`,
      {
        values: [data],
      }
    );
  }
}
