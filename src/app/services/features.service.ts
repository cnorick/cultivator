import { Injectable, inject } from '@angular/core';
import { map, shareReplay, startWith } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';

export const NOTES_HEADER = 'Notes';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  private googleSheetsService = inject(GoogleSheetsService);


  public readonly notesEnabled$ =
    this.googleSheetsService.transactionHeaders$.pipe(
      map((headers) =>
        headers.some(
          (h) => h.toString().toLowerCase() === NOTES_HEADER.toLowerCase()
        )
      ),
      shareReplay(1)
    );

  public readonly manualTransactionsEnabled$ =
    this.googleSheetsService.cultivatorGlobalDeveloperMetadataValue$.pipe(
      map((metadata) => !!metadata?.manualTransactionsEnabled),
      startWith(null),
      shareReplay(1)
    );

  public readonly splitEnabled$ =
    this.googleSheetsService.cultivatorGlobalDeveloperMetadataValue$.pipe(
      map((metadata) => !!metadata?.splitEnabled),
      startWith(null),
      shareReplay(1)
    );
  
  public readonly transfersEnabled$ = 
    this.googleSheetsService.cultivatorGlobalDeveloperMetadataValue$.pipe(
      map((metadata) => !!metadata?.transfersEnabled),
      startWith(null),
      shareReplay(1)
    );

  public enableNotesFeature() {
    this.googleSheetsService.addNotesHeader();
  }

  public enableManualTransactionsFeature() {
    this.googleSheetsService.updateGlobalMetadata({
      manualTransactionsEnabled: true,
    });
  }

  public disableManualTransactions() {
    this.googleSheetsService.updateGlobalMetadata({
      manualTransactionsEnabled: false,
    });
  }

  public enableSplitFeature() {
    this.googleSheetsService.updateGlobalMetadata({
      splitEnabled: true,
    });
  }

  public disableSplitFeature() {
    this.googleSheetsService.updateGlobalMetadata({
      splitEnabled: false,
    });
  }

  public disableTransfersFeature(): void {
    this.googleSheetsService.updateGlobalMetadata({
      transfersEnabled: false,
    });
  }

  public enableTransfersFeature(): void {
    this.googleSheetsService.updateGlobalMetadata({
      transfersEnabled: true,
    });
  }
}
