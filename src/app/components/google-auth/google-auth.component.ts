import { Component } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';
import { GoogleSheetsService } from 'src/app/services/google-sheets.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-google-auth',
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.less'],
})
export class GoogleAuthComponent {
  constructor(
    private googleAuthService: GoogleAuthService,
    private settings: SettingsService,
    private foo: GoogleSheetsService
  ) {}

  public handleAuthClick() {
    (window.location as any) = this.googleAuthService.createAuthUrl({
      route: '/',
    });
  }

  public handleFetchClick() {
    // TODO: make this dynamic
    this.settings.updateSettings({
      spreadsheetUrl: '',
    });
  }
}
