import {
  combineLatest,
  defer,
  merge,
  Observable,
  Subject,
  timer,
  tap,
  map,
  switchMap,
  timestamp,
  takeUntil,
  filter,
  startWith,
  skip,
} from 'rxjs';

export const refreshMap = <T, R>(
  callback: (sourceVal: T) => Observable<R>,
  refreshRate: number
) => {
  return (source$: Observable<T>) =>
    defer(() => {
      const refreshWithDelay$ = new Subject<number>();
      let sourceValue: T;
      return merge(
        source$.pipe(
          tap((value) => {
            sourceValue = value;
          }),
          map(() => 0)
        ),
        refreshWithDelay$
      ).pipe(
        switchMap((delay: number) => timer(delay)),
        timestamp(),
        switchMap((timestamp) =>
          callback(sourceValue).pipe(
            map((callbackValue) => ({
              startTime: timestamp.timestamp,
              callbackValue: callbackValue,
            })),
            takeUntil(source$.pipe(skip(1)))
          )
        ),
        timestamp(),
        tap((endTimestamp) =>
          refreshWithDelay$.next(
            Math.max(
              refreshRate -
                (endTimestamp.timestamp - endTimestamp.value.startTime),
              0
            )
          )
        ),
        map((endTimestamp) => endTimestamp.value.callbackValue)
      );
    });
};

// Ignore source emissions while the value in the provided stream is true.
export const pauseWhen =
  (pause$: Observable<boolean>) => (source$: Observable<unknown>) =>
    combineLatest([pause$.pipe(startWith(false)), source$]).pipe(
      filter(([pause, sourceVal]) => !pause),
      map(([pause, sourceVal]) => sourceVal)
    );
