import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GoogleAuthComponent } from './google-auth/google-auth.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
  ],
})
export class ComponentsModule {}
