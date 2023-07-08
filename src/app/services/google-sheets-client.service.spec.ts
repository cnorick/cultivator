import { TestBed } from '@angular/core/testing';

import { GoogleSheetsClientService } from './google-sheets-client.service';

describe('GoogleSheetsClientService', () => {
  let service: GoogleSheetsClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSheetsClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
