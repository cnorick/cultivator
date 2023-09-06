import { NgModule, isDevMode, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ComponentsModule } from './components/components.module';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaService } from './services/pwa.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SWUpdateService } from './services/sw-update.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageViewTrackingService } from './services/page-view-tracking.service';

const initializer = (pwaService: PwaService) => () =>
  pwaService.initPwaPrompt();

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    ComponentsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [PwaService, SWUpdateService, PageViewTrackingService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
