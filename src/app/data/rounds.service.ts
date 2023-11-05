import { Injectable, OnDestroy } from '@angular/core';
import { filter, first, map, Observable, shareReplay, Subscription, switchMap, throwError } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';
import { Couple, DANCE, generateId, generateRound, Id, Result, Round } from 'src/app/data/model.base';
import { StorageService } from 'src/app/data/storage.service';

const drawCouples = (value: number[], leads: Id[], follows: Id[]): Couple[][] => {

  const randInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const shuffle = <T>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      const ip = array[i];
      array[i] = array[j];
      array[j] = ip;
    }
    return array;
  };

  shuffle(leads);
  shuffle(follows);

  const returnValue: Couple[][] = [];
  let couple = 0;
  for (let heat = 0; heat < value.length; heat++) {
    returnValue.push([]);
    for (let coupleInHeat = 0; coupleInHeat < value[heat]; coupleInHeat++) {
      returnValue[heat].push({
        id: generateId(),
        type: '',
        lead: leads[couple],
        follow: follows[couple]
      });

      couple++;
    }
  }

  return returnValue;
};


@Injectable({
  providedIn: 'root'
})
export class RoundsService implements OnDestroy {

  public readonly rounds: Observable<Round[]>;

  public readonly currentRound: Observable<Round>;

  constructor(private participantsService: ParticipantsService, private storageService: StorageService) {
    this.rounds = this.storageService.read('Round').pipe(
      map(x => x.sort(RoundsService.sort)),
      shareReplay(1)
    );

    this.currentRound = this.rounds.pipe(
      filter(x => x.length > 0),
      map(x => x[x.length - 1]),
      shareReplay(1)
    );
  }

  private subscription = new Subscription();

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private static sort(round1: Round, round2: Round) {
    return round1.number - round2.number;
  }

  public canDraw(value: (null | number)[]): Observable<number> {
    return this.participantsService.locked.pipe(
      filter(x => x),
      switchMap(() => this.currentRound),
      first(),
      map(round => {
        if (round.state !== 'DRAFT') {
          return NaN;
        }

        const couples = round.results.leads.length;
        const expectedCouples = value.reduce((p1, p2) => (p1 ?? 0) + (p2 ?? 0), 0);

        return (expectedCouples ?? 0) - couples;
      })
    );
  }

  public suggestDraw(value: (null | number)[]): Observable<null> {
    return this.canDraw(value).pipe(
      switchMap(mismatch => {
        if (mismatch !== 0) {
          return throwError(() => mismatch);
        }

        return this.currentRound;
      }),
      first(),
      switchMap(round => {
        return this.storageService.edit('Round',
          x => x.id === round.id,
          x => ({
            ...x,
            heats: DANCE.flatMap(dance => {
              const couples = drawCouples(value.map(x => x ?? 0),
                round.results.leads.map(x => x.id),
                round.results.follows.map(x => x.id)
              );

              return couples.map((cpls, idx) => ({
                id: `${idx + 1}`,
                type: '',
                couples: cpls,
                dance: dance
              }));
            })
          })
        );
      })
    );
  }

  public startRound(round: Round) {
    return this.storageService.edit('Round',
      x => x.id === round.id,
      x => ({
        ...x,
        state: 'STARTED'
      })
    );
  }

  public evaluateRound(round: Round, results: Result) {
    return this.storageService.edit('Round',
      x => x.id === round.id,
      x => ({
        ...x,
        results: results,
        state: 'EVALUATED'
      })
    );
  }

  public finishRound(starters: { leads: Id[], follows: Id[] }, startNext: boolean) {
    return this.currentRound.pipe(
      first(),
      switchMap(x => this.storageService.edit('Round', r => r.id === x.id, r => ({
        ...r,
        state: 'SUPERSEDED',
        couplesKept: starters.leads.length
      })).pipe(map(() => x.number))),
      filter(() => startNext),
      map(round => generateRound(round + 1, starters)),
      switchMap(x => this.storageService.add('Round', x))
    );
  }
}
