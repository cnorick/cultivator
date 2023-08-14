import { Component } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  constructor(private googleAuth: GoogleAuthService) {}

  loggedIn$ = this.googleAuth.loggedIn$;
}
