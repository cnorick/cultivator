import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  @Input() loggedIn!: boolean;
  @Output() linkClick = new EventEmitter<void>();

  constructor(private googleAuth: GoogleAuthService) {}

  onLogout() {
    this.googleAuth.logout();
    this.linkClick.emit();
  }
}
