import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { authGuard } from './guards/auth.guard';
import { googleSheetIsSetGuard } from './guards/google-sheet-is-set.guard';

const routes: Routes = [
  {
    path: 'oauth2callback',
    component: AuthCallbackComponent,
    title: 'Oauth Callback',
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./pages/transactions/transactions.module').then(
        (m) => m.TransactionsModule
      ),
    canActivate: [authGuard, googleSheetIsSetGuard],
    data: {
      breadcrumb: 'Transactions',
    },
    title: 'Transactions',
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'Settings',
    },
    title: 'Settings',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
    data: {
      breadcrumb: 'Login',
    },
    title: 'Login',
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./pages/about/about.module').then((m) => m.AboutModule),
    data: {
      breadcrumb: 'About',
    },
    title: 'Cultivator Budget App',
  },
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
