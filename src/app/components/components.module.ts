import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GoogleAuthComponent } from './google-auth/google-auth.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionComponent } from './transaction/transaction.component';
import { MatCardModule } from '@angular/material/card';
import { NavComponent } from './nav/nav.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
    CategorySelectorComponent,
    TransactionComponent,
    NavComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    PageNotFoundComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    BreadcrumbsComponent,
    CategorySelectorComponent,
    TransactionComponent,
    NavComponent,
  ],
})
export class ComponentsModule {}
