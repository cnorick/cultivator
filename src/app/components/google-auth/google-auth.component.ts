import { Component } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-google-auth',
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.less'],
})
export class GoogleAuthComponent {
  constructor(private googleAuthService: GoogleAuthService) {}

  public handleAuthClick() {
    (window.location as any) = this.googleAuthService.createAuthUrl({
      route: '/',
    });
  }
}
