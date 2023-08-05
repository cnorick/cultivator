import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { SettingsService } from '../services/settings.service';

export const googleSheetIsSetGuard = () => {
  const settingsService = inject(SettingsService);
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  return settingsService.spreadsheetId$.pipe(
    map((spreadsheetId) => {
      if (!spreadsheetId) {
        snackbar.open(
          'Select your Tiller sheet before you can see transactions.'
        );
        return router.parseUrl('/settings');
      }

      return true;
    })
  );
};
