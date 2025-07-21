import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map, skipWhile } from 'rxjs';
import { FeaturesService } from '../services/features.service';

const supportedFeatures = ['notes', 'split', 'transfer'] as const;
type SupportedFeature = typeof supportedFeatures[number];

export const featureGuard = (feature: SupportedFeature) => () => {
  const featuresService = inject(FeaturesService);
  const snackbar = inject(MatSnackBar);
  const router = inject(Router);

  switch (feature) {
    case 'notes': {
      return featuresService.notesEnabled$.pipe(
        skipWhile((val) => val === null),
        map((enabled) => {
          if (!enabled) {
            snackbar.open('Notes not enabled.');
            return router.createUrlTree(['/settings']);
          } else return true;
        })
      );
    }

    case 'split': {
      return featuresService.splitEnabled$.pipe(
        skipWhile((val) => val === null),
        map((enabled) => {
          if (!enabled) {
            snackbar.open('Split not enabled.');
            return router.createUrlTree(['/settings']);
          } else return true;
        })
      );
    }

    case 'transfer': {
      return featuresService.transfersEnabled$.pipe(
        skipWhile((val) => val === null),
        map((enabled) => {
          if (!enabled) {
            snackbar.open('Transfers not enabled.');
            return router.createUrlTree(['/settings']);
          } else return true;
        })
      );
    }
  }
};
