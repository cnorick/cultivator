import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/types/category';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.less'],
})
export class CategorySelectorComponent {
  @Input() selectedCategory?: string;
  categoryCtl = new FormControl(this.selectedCategory);

  constructor(private categoryService: CategoryService) {}

  filteredCategories$ = combineLatest([
    this.categoryService.categories$,
    this.categoryCtl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([categories, searchString]) =>
      searchString
        ? this.filterCategories(categories, searchString)
        : categories.slice()
    )
  );

  private filterCategories(categories: Category[], value: string): Category[] {
    const filterValue = value.toLowerCase();
    return categories.filter(
      (c) =>
        c.category?.toLowerCase().includes(value) ||
        c.group?.toLowerCase().includes(filterValue)
    );
  }
}
