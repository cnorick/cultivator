import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-fab',
    templateUrl: './fab.component.html',
    styleUrls: ['./fab.component.scss'],
    standalone: false
})
export class FabComponent {
  public isExpanded = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.fab-main')) {
      this.isExpanded = !this.isExpanded;
    }
    else {
      this.isExpanded = false;
    }
  }
}
