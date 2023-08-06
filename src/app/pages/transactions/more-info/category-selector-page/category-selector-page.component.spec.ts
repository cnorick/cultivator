import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySelectorPageComponent } from './category-selector-page.component';

describe('CategorySelectorPageComponent', () => {
  let component: CategorySelectorPageComponent;
  let fixture: ComponentFixture<CategorySelectorPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategorySelectorPageComponent]
    });
    fixture = TestBed.createComponent(CategorySelectorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
