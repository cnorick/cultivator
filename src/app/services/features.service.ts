import { Injectable } from '@angular/core';
import { map, startWith } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';

export const NOTES_HEADER = 'Notes';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  constructor(private googleSheetsService: GoogleSheetsService) {}

  public readonly notesEnabled$ =
    this.googleSheetsService.transactionHeaders$.pipe(
      map((headers) =>
        headers.some(
          (h) => h.toString().toLowerCase() === NOTES_HEADER.toLowerCase()
        )
      ),
      startWith(null)
    );

  public enableNotesFeature() {
    this.googleSheetsService.addNotesHeader();
  }
}
