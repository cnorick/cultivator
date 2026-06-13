import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { map, startWith } from 'rxjs';
import { BreadcrumbsService } from './services/breadcrumbs.service';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleSheetsService } from './services/google-sheets.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private auth = inject(GoogleAuthService);
  private router = inject(Router);
  private breadcrumbs = inject(BreadcrumbsService);
  activatedRoute = inject(ActivatedRoute);
  private googleSheetsService = inject(GoogleSheetsService);

  // Sets initial value to true to show loading spinner on first load
  loading = true;

  constructor() {
    this.router.events.subscribe((e) => {
      this.navigationInterceptor(e);
    });
  }

  readonly offline$ = this.googleSheetsService.isOnline$.pipe(
    map((isOnline) => !isOnline)
  );
  readonly loggedIn$ = this.auth.loggedIn$.pipe(startWith(false));
  readonly isRootPage$ = this.breadcrumbs.breadcrumbs$.pipe(
    map((breadcrumbs) => breadcrumbs && breadcrumbs.length <= 1)
  );
  readonly parentPage$ = this.breadcrumbs.breadcrumbs$.pipe(
    map(
      (breadcrumbs) =>
        (breadcrumbs &&
          breadcrumbs.length > 1 &&
          breadcrumbs[breadcrumbs?.length - 2]) ||
        null
    ),
    map((breadcrumb) => breadcrumb?.url ?? '/')
  );

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
