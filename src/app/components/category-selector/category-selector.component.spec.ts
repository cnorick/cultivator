import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CategorySelectorComponent } from './category-selector.component';
import { CategoryService } from '../../services/category.service';

describe('CategorySelectorComponent', () => {
  let component: CategorySelectorComponent;
  let fixture: ComponentFixture<CategorySelectorComponent>;
  let mockCategoryService: any;

  beforeEach(() => {
    mockCategoryService = {
      categories$: of([
        { category: 'Food', group: 'Living', type: 'Expense' },
        { category: 'Rent', group: 'Bills', type: 'Expense' },
      ]),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule],
      declarations: [CategorySelectorComponent],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(CategorySelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
