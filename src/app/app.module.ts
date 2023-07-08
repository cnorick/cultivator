import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleAuthComponent } from './components/google-auth/google-auth.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    GoogleAuthComponent,
    AuthCallbackComponent,
    PageNotFoundComponent,
    TransactionsComponent,
    SettingsComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
