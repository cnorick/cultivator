import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';

export const authGuard = () => {
  const authService = inject(GoogleAuthService);
  const router = inject(Router);

  return authService.loggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        if (!authService.existingUser) {
          return router.createUrlTree(['/about']);
        }
        return authService.reauthenticate();
      }
      return isLoggedIn;
    })
  );
};
