import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleAuthService } from './google-auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsClientService {
  private readonly endpoint = 'https://sheets.googleapis.com';
  private readonly version = 'v4';
  private readonly baseUrl = `${this.endpoint}/${this.version}/spreadsheets`;

  private accessToken: string | undefined;

  constructor(private auth: GoogleAuthService, private http: HttpClient) {
    this.auth.accessToken$.subscribe(
      (accessToken) => (this.accessToken = accessToken)
    );
  }

  private get<T>(url: string) {
    if (!this.accessToken) {
      throw new Error('Not logged into Google.');
    }

    return this.http.get<T>(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
  }

  public getAllSheets(spreadsheetId: string) {
    return this.get<any>(`${this.baseUrl}/${spreadsheetId}`);
  }

  public getSpreadsheetValues(spreadsheetId: string, sheetTitle: string) {
    return this.get<any>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetTitle}`
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
}
