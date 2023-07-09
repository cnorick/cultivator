import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GoogleAuthComponent } from './google-auth/google-auth.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { CategorySelectorComponent } from './category-selector/category-selector.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
    CategorySelectorComponent,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
    CategorySelectorComponent,
  ],
})
export class ComponentsModule {}
