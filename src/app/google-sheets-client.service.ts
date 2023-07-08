import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetsClientService {
  private readonly endpoint = 'https://sheets.googleapis.com';
  private readonly version = 'v4';
  private readonly baseUrl = `${this.endpoint}/${this.version}/spreadsheets`;

  constructor(private auth: GoogleAuthService, private http: HttpClient) {}

  private get<T>(url: string) {
    return this.http.get<T>(url, {
      headers: { Authorization: `Bearer ${this.auth.accessToken}` },
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

  public getSheeIdFromUrl(url?: string) {
    return url?.match(/#gid=(\d)*/)?.[1];
  }
}
