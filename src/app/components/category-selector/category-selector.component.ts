import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { combineLatest, map, startWith, Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/types/category';
import FuzzySearch from 'fuzzy-search';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.less'],
})
export class CategorySelectorComponent implements OnInit, OnDestroy {
  @Input() selectedCategory?: string;
  @Output() selectedCategoryChange = new EventEmitter<Category>();

  private destroy$ = new Subject<void>();
  categoryCtl = new FormControl('None');
  filteredCategories: Category[] = [];

  constructor(private categoryService: CategoryService) {
    this.filteredCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => (this.filteredCategories = categories));
  }

  ngOnInit(): void {
    this.categoryCtl.setValue(this.selectedCategory || 'None');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filteredCategories$ = combineLatest([
    this.categoryService.categories$.pipe(
      map((categories) => [{ category: 'None' } as Category, ...categories])
    ),
    this.categoryCtl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([categories, searchString]) =>
      searchString
        ? this.filterCategories(categories, searchString)
        : categories.slice()
    ),
    map((filteredCategories) =>
      filteredCategories.sort((a, b) => a.category.localeCompare(b.category))
    )
  );

  private filterCategories(categories: Category[], value: string): Category[] {
    if (value.toLowerCase() === 'none') {
      return categories;
    }

    const searcher = new FuzzySearch(categories, ['group', 'category'], {
      caseSensitive: false,
    });

    return searcher.search(value);
  }

  onCategoryChange(event: MatAutocompleteSelectedEvent) {
    this.setCategory(event.option.value);
  }

  private setCategory(categoryString: string) {
    const category = this.filteredCategories?.find(
      (c) => c.category === categoryString
    );
    if (category?.category === this.selectedCategory) {
      return;
    } else if (category?.category === 'None') {
      this.selectedCategoryChange.emit({ category: '' } as any);
    } else if (category) {
      this.selectedCategoryChange.emit(category);
    }

    this.selectedCategory = categoryString;
  }

  onInputFocus(event: FocusEvent) {
    (event.target as any).select();
  }

  onInputSubmit() {
    if (this.filteredCategories.length) {
      const categoryString = this.filteredCategories[0].category;
      this.categoryCtl.setValue(categoryString);
      this.setCategory(categoryString);
    }
  }
}
