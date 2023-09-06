import { TestBed } from '@angular/core/testing';

import { PageViewTrackingService } from './page-view-tracking.service';

describe('PageViewTrackingService', () => {
  let service: PageViewTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageViewTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
