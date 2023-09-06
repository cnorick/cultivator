import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

declare global {
  interface Window {
    gtag: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PageViewTrackingService {
  constructor(private router: Router, private activeRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let leaf = this.activeRoute.root;
          while (leaf.firstChild) {
            leaf = leaf.firstChild;
          }
          return leaf;
        }),
        map((route) => route.snapshot)
      )
      .subscribe((activatedRouteSnapshot) => {
        const pageTitle =
          activatedRouteSnapshot?.data?.['gaTitle'] ??
          activatedRouteSnapshot.title;

        window.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.host + this.router.url,
        });
      });
  }
}
