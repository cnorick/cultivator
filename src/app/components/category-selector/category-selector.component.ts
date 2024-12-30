import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { combineLatest, map, startWith, Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/services/category.service';
import { Category, CATEGORY_LOADING_VAL } from 'src/app/types/category';
import FuzzySearch from 'fuzzy-search';

@Component({
    selector: 'app-category-selector',
    templateUrl: './category-selector.component.html',
    styleUrls: ['./category-selector.component.scss'],
    standalone: false
})
export class CategorySelectorComponent implements OnInit, OnDestroy {
  @Input()
  set selectedCategory(val: string | undefined) {
    this._selectedCategory = val;
    if (this.selectedCategory === CATEGORY_LOADING_VAL) {
      this.selectedCategory = '...Loading';
    }
    this.categoryCtl.setValue(this.selectedCategory || 'None');
  }
  get selectedCategory(): string | undefined {
    return this._selectedCategory;
  }
  private _selectedCategory?: string;

  @Output() selectedCategoryChange = new EventEmitter<Category>();

  @ViewChild('input') inputEl!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  categoryCtl = new FormControl('None');
  filteredCategories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.filteredCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => (this.filteredCategories = categories));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  focus(): void {
    window.setTimeout(() => {
      this.inputEl.nativeElement.focus({ preventScroll: true });
      this.onInputFocus({ target: this.inputEl.nativeElement } as any);
      this.cdr.detectChanges();
    }, 40);
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
