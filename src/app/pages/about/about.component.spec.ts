import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { AboutComponent } from './about.component';
import { GoogleAuthService } from '../../services/google-auth.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let mockGoogleAuth: any;

  beforeEach(() => {
    mockGoogleAuth = {
      loggedIn$: of(false),
      existingUser: false,
    };

    TestBed.configureTestingModule({
      declarations: [AboutComponent],
      providers: [
        { provide: GoogleAuthService, useValue: mockGoogleAuth },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
