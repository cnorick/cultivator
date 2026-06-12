import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GoogleAuthComponent } from './google-auth.component';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

describe('GoogleAuthComponent', () => {
  let component: GoogleAuthComponent;
  let fixture: ComponentFixture<GoogleAuthComponent>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;

  beforeEach(() => {
    mockGoogleAuthService = jasmine.createSpyObj('GoogleAuthService', ['createAuthUrl']);

    TestBed.configureTestingModule({
      declarations: [GoogleAuthComponent],
      providers: [
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(GoogleAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
