import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  catchError,
  first,
  Observable,
  OperatorFunction,
  switchMap,
  throwError,
} from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { LogService } from './log.service';

// --- Sheets API Response Types ---
// Source: https://sheets.googleapis.com/$discovery/rest?version=v4
// Docs: https://developers.google.com/sheets/api/reference/rest/v4

/**
 * Subset of the SheetProperties schema.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/sheets#SheetProperties
 */
export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
}

/**
 * Subset of the DeveloperMetadata schema.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata#DeveloperMetadata
 */
export interface DeveloperMetadataEntry {
  metadataId?: number;
  metadataKey: string;
  metadataValue?: string;
  location?: { spreadsheet?: boolean };
  visibility?: string;
}

/** A sheet with its properties and optional developer metadata. */
export interface SheetInfo {
  properties: SheetProperties;
  developerMetadata?: DeveloperMetadataEntry[];
}

/**
 * Response from spreadsheets.get. Subset of the Spreadsheet resource.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet
 */
export interface SpreadsheetsGetResponse {
  spreadsheetId: string;
  properties?: Record<string, unknown>;
  sheets: SheetInfo[];
  developerMetadata?: DeveloperMetadataEntry[];
}

/**
 * Response from spreadsheets.values.get. Maps to the ValueRange schema.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange
 */
export interface ValuesGetResponse {
  range: string;
  majorDimension: string;
  values: (string | number)[][];
}

/**
 * Response from spreadsheets.values.update. Maps to UpdateValuesResponse.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse
 */
export interface ValuesUpdateResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

/**
 * Response from spreadsheets.values.append. Maps to AppendValuesResponse.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/AppendValuesResponse
 */
export interface ValuesAppendResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: ValuesUpdateResponse;
}

/**
 * Response from spreadsheets.batchUpdate. Maps to BatchUpdateSpreadsheetResponse.
 * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate#response-body
 */
export interface BatchUpdateResponse {
  spreadsheetId: string;
  replies: Record<string, unknown>[];
}

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsClientService {
  private readonly endpoint = 'https://sheets.googleapis.com';
  private readonly version = 'v4';
  private readonly baseUrl = `${this.endpoint}/${this.version}/spreadsheets`;

  constructor(
    private auth: GoogleAuthService,
    private http: HttpClient,
    private logger: LogService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}

  /**
   * Shared error handler for all HTTP requests.
   * Checks for 401 (logged out), logs the error, and re-throws.
   */
  private handleError<T>(url: string): OperatorFunction<T, T> {
    return catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.logger.log('Logged out');
        const snack = this.snackbar.open('You are logged out.', 'Log back in', {
          duration: 25_000,
        });
        snack.onAction().subscribe(() => this.router.navigate(['/login']));
      }
      this.logger.log(`Error making request to ${url}`);
      this.logger.log(error);
      return throwError(() => error);
    });
  }

  /**
   * Makes an authenticated GET request.
   * Takes the latest access token reactively at request time.
   */
  private get<T>(url: string): Observable<T> {
    return this.auth.accessToken$.pipe(
      first(),
      switchMap((token) => {
        if (!token) {
          this.logger.error(
            'Not logged into Google. Access Token is not defined'
          );
          return throwError(() => new Error('Not logged into Google.'));
        }
        return this.http.get<T>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }),
      this.handleError(url)
    );
  }

  /**
   * Makes an authenticated PUT request.
   * Takes the latest access token reactively at request time.
   */
  private put<T>(url: string, body: unknown): Observable<T> {
    return this.auth.accessToken$.pipe(
      first(),
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Not logged into Google.'));
        }
        return this.http.put<T>(url, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }),
      this.handleError(url)
    );
  }

  /**
   * Makes an authenticated POST request.
   * Takes the latest access token reactively at request time.
   */
  private post<T>(url: string, body: unknown): Observable<T> {
    return this.auth.accessToken$.pipe(
      first(),
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Not logged into Google.'));
        }
        return this.http.post<T>(url, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }),
      this.handleError(url)
    );
  }

  public getAllSheets(
    spreadsheetId: string
  ): Observable<SpreadsheetsGetResponse> {
    return this.get<SpreadsheetsGetResponse>(
      `${this.baseUrl}/${spreadsheetId}`
    );
  }

  /**
   * https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
   */
  public getSpreadsheetValues(
    spreadsheetId: string,
    range: string
  ): Observable<ValuesGetResponse> {
    return this.get<ValuesGetResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`
    );
  }

  public getSpreadsheetIdFromUrl(url?: string) {
    return url?.match(
      /https:\/\/docs.google.com\/spreadsheets\/d\/([^\/]*)/
    )?.[1];
  }

  public getSheetIdFromUrl(url?: string) {
    return url?.match(/#gid=(\d+)/)?.[1];
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
    data: (string | number | null | undefined)[]
  ): Observable<ValuesUpdateResponse> {
    const formattedRange = `${sheetTitle}!${rowNum}:${rowNum}`;
    return this.put<ValuesUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${formattedRange}?valueInputOption=RAW`,
      {
        values: [data],
      }
    );
  }

  /**
   *
   * @param spreadsheetId
   * @param sheetTitle
   * @param rowNum the 1-based row number, corresponding to the sheet row number at which
   * we should insert the new row. The current value at that row will be pushed down.
   * @param data
   */
  public appendRow(
    spreadsheetId: string,
    sheetTitle: string,
    rowNum: number,
    data: (string | number | null | undefined)[]
  ): Observable<ValuesAppendResponse> {
    const formattedRange = `${sheetTitle}!A${rowNum}:A${rowNum}`;
    return this.post<ValuesAppendResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${formattedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        values: [data],
      }
    );
  }

  /**
   *
   * @param spreadsheetId
   * @param sheetTitle
   * @param rowNum the 1-based row number, corresponding to the sheet row number at which
   * we should insert the new rows. The current value at that row will be pushed down
   * @param data
   * @returns
   */
  public appendRows(
    spreadsheetId: string,
    sheetTitle: string,
    rowNum: number,
    data: (string | number | null | undefined)[][]
  ): Observable<ValuesAppendResponse> {
    const formattedRange = `${sheetTitle}!A${rowNum}:A${rowNum}`;
    return this.post<ValuesAppendResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${formattedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        values: data,
      }
    );
  }

  public deleteGlobalMetadata(
    spreadsheetId: string,
    metadataKey: string
  ): Observable<BatchUpdateResponse> {
    return this.post<BatchUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
      {
        requests: [
          {
            deleteDeveloperMetadata: {
              dataFilter: {
                developerMetadataLookup: {
                  metadataLocation: {
                    spreadsheet: true,
                  },
                  metadataKey: metadataKey,
                },
              },
            },
          },
        ],
      }
    );
  }
  public updateGlobalMetadata(
    spreadsheetId: string,
    metadataKey: string,
    metadataValue: string,
    visibility: 'DOCUMENT' | 'PROJECT'
  ): Observable<BatchUpdateResponse> {
    return this.post<BatchUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
      {
        requests: [
          {
            updateDeveloperMetadata: {
              dataFilters: [
                {
                  developerMetadataLookup: {
                    metadataLocation: {
                      spreadsheet: true,
                    },
                    metadataKey,
                  },
                },
              ],
              developerMetadata: {
                metadataKey,
                metadataValue,
                location: {
                  spreadsheet: true,
                },
                visibility,
              },
              fields: '*',
            },
          },
        ],
      }
    );
  }

  public addGlobalMetadata(
    spreadsheetId: string,
    metadataKey: string,
    metadataValue: string,
    visibility: 'DOCUMENT' | 'PROJECT'
  ): Observable<BatchUpdateResponse> {
    return this.post<BatchUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
      {
        requests: [
          {
            createDeveloperMetadata: {
              developerMetadata: {
                metadataKey,
                metadataValue,
                location: {
                  spreadsheet: true,
                },
                visibility,
              },
            },
          },
        ],
      }
    );
  }
}
