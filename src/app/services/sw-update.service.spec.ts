import { TestBed } from '@angular/core/testing';

import { SWUpdateService } from './sw-update.service';

describe('SWUpdateService', () => {
  let service: SWUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SWUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
