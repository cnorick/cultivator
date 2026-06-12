import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs.service';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let mockBreadcrumbsService: any;

  beforeEach(() => {
    mockBreadcrumbsService = {
      breadcrumbs$: of([]),
    };

    TestBed.configureTestingModule({
      declarations: [BreadcrumbsComponent],
      providers: [
        { provide: BreadcrumbsService, useValue: mockBreadcrumbsService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
