import { TestBed } from '@angular/core/testing';
import { LogService } from './log.service';

describe('LogService', () => {
  let service: LogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogService);
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log debug messages to console', () => {
    service.log('debug message');
    expect(console.log).toHaveBeenCalledWith('debug message');
  });

  it('should log warn messages to console', () => {
    service.warn('warning message');
    expect(console.warn).toHaveBeenCalledWith('warning message');
  });

  it('should log error messages to console', () => {
    service.error('error message');
    expect(console.error).toHaveBeenCalledWith('error message');
  });

  it('should trigger a download of logs when downloadLogs is called', () => {
    const mockAnchor = document.createElement('a');
    spyOn(mockAnchor, 'click');
    spyOn(mockAnchor, 'setAttribute');
    spyOn(document, 'createElement').and.returnValue(mockAnchor);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    service.warn('saved warn log');
    service.downloadLogs();

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', jasmine.any(String));
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
  });
});
