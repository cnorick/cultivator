import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { PageViewTrackingService } from './page-view-tracking.service';

describe('PageViewTrackingService', () => {
  let service: PageViewTrackingService;
  let routerEvents$: Subject<any>;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    window.gtag = jasmine.createSpy('gtag');
    routerEvents$ = new Subject<any>();

    mockRouter = {
      events: routerEvents$,
      url: '/test-url',
    };

    mockActivatedRoute = {
      root: {
        firstChild: {
          snapshot: {
            title: 'Test Page',
            data: { gaTitle: 'Custom GA Title' },
          },
          firstChild: null,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        PageViewTrackingService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    service = TestBed.inject(PageViewTrackingService);
  });

  afterEach(() => {
    delete (window as any).gtag;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track page view on NavigationEnd', () => {
    routerEvents$.next(new NavigationEnd(1, '/test-url', '/test-url'));

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_title: 'Custom GA Title',
      page_location: window.location.host + '/test-url',
    });
  });

  it('should fallback to route title if gaTitle is not defined', () => {
    mockActivatedRoute.root.firstChild.snapshot.data = {};
    mockActivatedRoute.root.firstChild.snapshot.title = 'Fallback Title';

    routerEvents$.next(new NavigationEnd(1, '/test-url', '/test-url'));

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_title: 'Fallback Title',
      page_location: window.location.host + '/test-url',
    });
  });
});
