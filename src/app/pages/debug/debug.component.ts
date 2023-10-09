import { Component } from '@angular/core';
import { GoogleSheetsService } from 'src/app/services/google-sheets.service';
import { LogService } from 'src/app/services/log.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss'],
})
export class DebugComponent {
  constructor(
    private logger: LogService,
    private sheetsService: GoogleSheetsService
  ) {}

  onDownloadLogsClick() {
    this.logger.downloadLogs();
  }

  onDeleteSheetMetadata() {
    this.sheetsService.deleteMetadata();
  }
}
