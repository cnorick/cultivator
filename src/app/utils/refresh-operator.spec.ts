import { of, Subject, take } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { refreshMap, pauseWhen } from './refresh-operator';

describe('refresh-operator', () => {
  describe('pauseWhen', () => {
    it('should ignore source emissions when pause$ emits true', () => {
      const source$ = new Subject<number>();
      const pause$ = new Subject<boolean>();
      const results: number[] = [];

      source$.pipe(pauseWhen(pause$)).subscribe((val) => results.push(val as number));

      // Initially not paused
      source$.next(1);
      expect(results).toEqual([1]);

      // Pause
      pause$.next(true);
      source$.next(2);
      expect(results).toEqual([1]);

      // Resume
      pause$.next(false);
      source$.next(3);
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('refreshMap', () => {
    it('should map source value to callback and refresh automatically after refreshRate', fakeAsync(() => {
      const source$ = new Subject<string>();
      const results: string[] = [];

      let callCount = 0;
      const callback = (val: string) => {
        callCount++;
        return of(`${val}-${callCount}`);
      };

      // Refresh rate of 1000ms
      const subscription = source$
        .pipe(refreshMap(callback, 1000))
        .subscribe((res) => results.push(res));

      source$.next('input');
      tick(0); // Trigger initial timer(0)

      // Initial call should execute immediately
      expect(callCount).toBe(1);
      expect(results).toEqual(['input-1']);

      // Advance by 500ms - no new call
      tick(500);
      expect(callCount).toBe(1);

      // Advance to 1000ms - should trigger a refresh
      tick(500);
      expect(callCount).toBe(2);
      expect(results).toEqual(['input-1', 'input-2']);

      // Advance another 1000ms - should trigger another refresh
      tick(1000);
      expect(callCount).toBe(3);
      expect(results).toEqual(['input-1', 'input-2', 'input-3']);

      subscription.unsubscribe();
    }));
  });
});
