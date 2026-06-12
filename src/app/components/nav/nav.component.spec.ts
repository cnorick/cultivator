import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from './nav.component';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let mockGoogleAuth: jasmine.SpyObj<GoogleAuthService>;

  beforeEach(() => {
    mockGoogleAuth = jasmine.createSpyObj('GoogleAuthService', ['logout']);

    TestBed.configureTestingModule({
      declarations: [NavComponent],
      providers: [
        { provide: GoogleAuthService, useValue: mockGoogleAuth },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
