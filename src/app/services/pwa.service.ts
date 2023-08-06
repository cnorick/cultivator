import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { timer, take } from 'rxjs';
import { PromptComponent } from '../components/prompt/prompt.component';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private static readonly LAST_PROMPTED_KEY = 'last_prompted_pwa';
  private static readonly PROMPT_REFRACTORY_PERIOD = 7 * 24 * 60 * 60 * 1000; // milliseconds
  private static readonly PROMPT_INITIAL_DELAY = 60 * 1000; // milliseconds
  private promptEvent: any;

  constructor(
    private bottomSheet: MatBottomSheet,
    private platform: Platform,
    private localStorage: LocalStorageService
  ) {}

  public initPwaPrompt() {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.openPromptComponent('android');
      });
    }
    if (this.platform.IOS) {
      const isInStandaloneMode =
        'standalone' in window.navigator &&
        (<any>window.navigator)['standalone'];
      if (!isInStandaloneMode) {
        this.openPromptComponent('ios');
      }
    }
  }

  private openPromptComponent(mobileType: 'ios' | 'android') {
    const lastPrompted = this.localStorage.getItem(
      PwaService.LAST_PROMPTED_KEY
    );

    let timeToNextPrompt = PwaService.PROMPT_INITIAL_DELAY;
    if (lastPrompted) {
      const lastPromptedDate = new Date(lastPrompted);
      timeToNextPrompt =
        PwaService.PROMPT_REFRACTORY_PERIOD -
        (Date.now() - lastPromptedDate.getTime());
    }

    timer(timeToNextPrompt)
      .pipe(take(1))
      .subscribe(() => {
        this.localStorage.setItem(
          PwaService.LAST_PROMPTED_KEY,
          new Date().toISOString()
        );
        this.bottomSheet.open(PromptComponent, {
          data: { mobileType, promptEvent: this.promptEvent },
        });
      });
  }
}
