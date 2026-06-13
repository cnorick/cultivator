import { Component, inject } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: false
})
export class AboutComponent {
  private googleAuth = inject(GoogleAuthService);


  loggedIn$ = this.googleAuth.loggedIn$;
}
