import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryService } from './category.service';
import { GoogleSheetsService } from './google-sheets.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockGoogleSheets: any;

  beforeEach(() => {
    mockGoogleSheets = {
      categoryData$: of([
        { category: 'Food', group: 'Living' },
        { category: '', group: 'Empty' },
        { category: 'Utilities', group: 'Bills' },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        { provide: GoogleSheetsService, useValue: mockGoogleSheets },
      ],
    });
    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit categories and filter out empty categories', (done) => {
    service.categories$.subscribe((categories) => {
      expect(categories.length).toBe(2);
      expect(categories[0].category).toBe('Food');
      expect(categories[1].category).toBe('Utilities');
      done();
    });
  });
});
