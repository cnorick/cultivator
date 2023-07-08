import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthState } from 'src/app/types/auth-state';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.less'],
})
export class AuthCallbackComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.fragment.subscribe((fragment) => {
      const error = fragment?.match(/error=([^&]*)/)?.[1];
      if (error) {
        console.error(error);
        return;
      }
      const accessToken = fragment?.match(/access_token=([^&]*)/)?.[1];
      const expiresIn = fragment?.match(/expires_in=([^&]*)/)?.[1];
      const stateString = fragment?.match(/state=([^&]*)/)?.[1];

      if (accessToken && expiresIn) {
        this.googleAuthService.setToken({
          accessToken,
          expiresIn: Number(expiresIn),
        });
      }

      if (stateString) {
        const state = JSON.parse(stateString) as AuthState;
        this.router.navigateByUrl(state.route ?? '/');
      }
    });
  }
}
