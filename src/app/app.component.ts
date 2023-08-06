import { Component } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { startWith } from 'rxjs';
import { GoogleAuthService } from './services/google-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Sets initial value to true to show loading spinner on first load
  loading = true;

  constructor(private auth: GoogleAuthService, private router: Router) {
    this.router.events.subscribe((e) => {
      this.navigationInterceptor(e);
    });
  }

  readonly loggedIn$ = this.auth.loggedIn$.pipe(startWith(false));

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: any): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
  }
}
