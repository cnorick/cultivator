import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { SWUpdateService } from './sw-update.service';

describe('SWUpdateService', () => {
  let service: SWUpdateService;
  let mockSwUpdate: any;
  let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
  let versionUpdates$: Subject<any>;

  beforeEach(() => {
    versionUpdates$ = new Subject<any>();
    mockSwUpdate = {
      versionUpdates: versionUpdates$.asObservable(),
      isEnabled: true,
    };
    mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        SWUpdateService,
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ],
    });
    service = TestBed.inject(SWUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a snackbar when VERSION_READY event is emitted', () => {
    mockSnackbar.open.and.returnValue({
      onAction: () => new Subject<void>().asObservable(),
    } as any);

    versionUpdates$.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'old-hash' },
      latestVersion: { hash: 'new-hash' },
    });

    expect(mockSnackbar.open).toHaveBeenCalledWith(
      'A new version of the app is available',
      'Update Now',
      { duration: 30000 }
    );
  });
});
