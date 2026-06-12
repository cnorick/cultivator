import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { PromptComponent } from './prompt.component';

describe('PromptComponent', () => {
  let component: PromptComponent;
  let fixture: ComponentFixture<PromptComponent>;
  let mockBottomSheetRef: jasmine.SpyObj<MatBottomSheetRef<PromptComponent>>;

  beforeEach(() => {
    mockBottomSheetRef = jasmine.createSpyObj('MatBottomSheetRef', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [PromptComponent],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { mobileType: 'android', promptEvent: null } },
        { provide: MatBottomSheetRef, useValue: mockBottomSheetRef },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(PromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
