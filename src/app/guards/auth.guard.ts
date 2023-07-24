import { inject } from '@angular/core';
import { map } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';

export const authGuard = () => {
  const authService = inject(GoogleAuthService);
  // const router = inject(Router);

  return authService.loggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return authService.reauthenticate();
      }
      return isLoggedIn;
    })
  );
};
