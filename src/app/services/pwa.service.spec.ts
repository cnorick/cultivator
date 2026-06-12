import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Platform } from '@angular/cdk/platform';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PwaService } from './pwa.service';
import { LocalStorageService } from './local-storage.service';

describe('PwaService', () => {
  let service: PwaService;
  let mockBottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let mockPlatform: any;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    mockBottomSheet = jasmine.createSpyObj('MatBottomSheet', ['open']);
    mockPlatform = {
      ANDROID: false,
      IOS: false,
    };
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: MatBottomSheet, useValue: mockBottomSheet },
        { provide: Platform, useValue: mockPlatform },
        { provide: LocalStorageService, useValue: mockLocalStorage },
      ],
    });
    service = TestBed.inject(PwaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should schedule prompt on Android when beforeinstallprompt fires', fakeAsync(() => {
    mockPlatform.ANDROID = true;
    mockLocalStorage.getItem.and.returnValue(null);

    service.initPwaPrompt();

    // Trigger window event
    const event = jasmine.createSpyObj('beforeinstallprompt', ['preventDefault']);
    const beforeInstallEvent = new CustomEvent('beforeinstallprompt');
    (beforeInstallEvent as any).preventDefault = event.preventDefault;

    window.dispatchEvent(beforeInstallEvent);

    // Initial delay is 60s (60000ms)
    tick(60000);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'last_prompted_pwa',
      jasmine.any(String)
    );
    expect(mockBottomSheet.open).toHaveBeenCalled();
  }));

  it('should schedule prompt on iOS immediately if standalone mode is false', fakeAsync(() => {
    mockPlatform.IOS = true;
    mockLocalStorage.getItem.and.returnValue(null);

    // mock standalone state in window.navigator
    Object.defineProperty(window.navigator, 'standalone', {
      value: false,
      configurable: true,
    });

    service.initPwaPrompt();

    tick(60000);

    expect(mockBottomSheet.open).toHaveBeenCalled();
  }));
});
