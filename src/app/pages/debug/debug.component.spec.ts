import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DebugComponent } from './debug.component';
import { LogService } from 'src/app/services/log.service';
import { GoogleSheetsService } from 'src/app/services/google-sheets.service';

describe('DebugComponent', () => {
  let component: DebugComponent;
  let fixture: ComponentFixture<DebugComponent>;
  let mockLogService: jasmine.SpyObj<LogService>;
  let mockGoogleSheetsService: jasmine.SpyObj<GoogleSheetsService>;

  beforeEach(() => {
    mockLogService = jasmine.createSpyObj('LogService', ['downloadLogs']);
    mockGoogleSheetsService = jasmine.createSpyObj('GoogleSheetsService', ['deleteMetadata']);

    TestBed.configureTestingModule({
      declarations: [DebugComponent],
      providers: [
        { provide: LogService, useValue: mockLogService },
        { provide: GoogleSheetsService, useValue: mockGoogleSheetsService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(DebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
