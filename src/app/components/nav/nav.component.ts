import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    standalone: false
})
export class NavComponent {
  private googleAuth = inject(GoogleAuthService);

  @Input() loggedIn!: boolean;
  @Output() linkClick = new EventEmitter<void>();

  onLogout() {
    this.googleAuth.logout();
    this.linkClick.emit();
  }
}
