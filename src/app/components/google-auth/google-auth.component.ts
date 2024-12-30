import { Component } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
    selector: 'app-google-auth',
    templateUrl: './google-auth.component.html',
    styleUrls: ['./google-auth.component.scss'],
    standalone: false
})
export class GoogleAuthComponent {
  constructor(private googleAuthService: GoogleAuthService) {}
  public handleAuthClick() {
    (window.location as any) = this.googleAuthService.createAuthUrl({
      route: '/',
    });
  }
}
