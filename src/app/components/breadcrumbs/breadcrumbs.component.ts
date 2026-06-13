import { Component, inject } from '@angular/core';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs.service';

export interface BreadCrumb {
  label: string;
  url: string;
}

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    standalone: false
})
export class BreadcrumbsComponent {
  private breadcrumbsService = inject(BreadcrumbsService);


  readonly breadcrumbs$ = this.breadcrumbsService.breadcrumbs$;
}
