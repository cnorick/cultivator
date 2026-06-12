import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BreadcrumbsService } from './breadcrumbs.service';

describe('BreadcrumbsService', () => {
  let service: BreadcrumbsService;
  let routerEvents$: Subject<any>;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    routerEvents$ = new Subject<any>();
    mockRouter = {
      events: routerEvents$,
    };

    mockActivatedRoute = {
      root: {
        routeConfig: null,
        firstChild: {
          routeConfig: {
            path: 'home',
            data: { breadcrumb: 'Home Page' },
          },
          firstChild: {
            routeConfig: {
              path: 'settings',
              data: { breadcrumb: 'Settings Page' },
            },
            firstChild: null,
          },
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        BreadcrumbsService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    service = TestBed.inject(BreadcrumbsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build breadcrumbs on NavigationEnd', (done) => {
    service.breadcrumbs$.subscribe((breadcrumbs) => {
      // First emission is null due to startWith(null)
      if (breadcrumbs) {
        expect(breadcrumbs.length).toBe(2);
        expect(breadcrumbs[0].label).toBe('Home Page');
        expect(breadcrumbs[0].url).toBe('/home');
        expect(breadcrumbs[1].label).toBe('Settings Page');
        expect(breadcrumbs[1].url).toBe('/home/settings');
        done();
      }
    });

    routerEvents$.next(new NavigationEnd(1, '/home/settings', '/home/settings'));
  });
});
