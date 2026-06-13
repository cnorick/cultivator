import { Component, inject } from '@angular/core';
import { GoogleSheetsService } from 'src/app/services/google-sheets.service';
import { LogService } from 'src/app/services/log.service';

@Component({
    selector: 'app-debug',
    templateUrl: './debug.component.html',
    styleUrls: ['./debug.component.scss'],
    standalone: false
})
export class DebugComponent {
  private logger = inject(LogService);
  private sheetsService = inject(GoogleSheetsService);


  onDownloadLogsClick() {
    this.logger.downloadLogs();
  }

  onDeleteSheetMetadata() {
    this.sheetsService.deleteMetadata();
  }
}
