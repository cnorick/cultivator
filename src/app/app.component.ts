import { Component } from '@angular/core';
import { startWith } from 'rxjs';
import { GoogleAuthService } from './services/google-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private auth: GoogleAuthService) {}

  readonly loggedIn$ = this.auth.loggedIn$.pipe(startWith(false));
}
