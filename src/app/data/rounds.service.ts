import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, EMPTY, filter, first, map, Observable, shareReplay, Subscription, switchMap, throwError } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';
import { Couple, DANCE, generateId, Id, Result, Round } from 'src/app/data/model.base';
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

const generateRound = (previous: Round | null, starters: { leads: Id[], follows: Id[] }): Round => {
  if (starters.leads.length !== starters.follows.length) throw new Error();
  if(previous?.state !== 'EVALUATED') throw new Error();

  return {
    id: generateId(),
    type: 'Round',
    number: (previous?.number ?? 0) + 1,
    state: 'DRAFT',
    heats: [],
    results: {
      leads: starters.leads.map(x => ({
        id: x,
        type: '' as const,
        points: 0
      })),
      follows: starters.follows.map(x => ({
        id: x,
        type: '' as const,
        points: 0
      }))
    }
  };
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
      map(x => x[x.length - 1])
    );

    this.subscription.add(combineLatest([ this.participantsService.locked, this.rounds ]).pipe(
      switchMap(([ locked, rounds ]) => {
        if (!locked && rounds.length > 0) {
          return this.storageService.store('Round', []);
        } else if (locked && rounds.length == 0) {
          return this.participantsService.participants.pipe(
            first(),
            map(p => generateRound(null, {
              leads: p.filter(x => x.role === 'LEAD').map(x => x.id),
              follows: p.filter(x => x.role === 'FOLLOW').map(x => x.id)
            })),
            switchMap(round => this.storageService.store('Round', [round]))
          );
        } else {
          return EMPTY;
        }
      })).subscribe());
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
          x => x.state === 'DRAFT',
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

  public startRound() {
    return this.storageService.edit('Round',
      x => x.state === 'DRAFT',
      x => ({
        ...x,
        state: 'STARTED'
      })
    );
  }

  public evaluateRound(results: Result) {
    return this.storageService.edit('Round',
      x => x.state === 'STARTED',
      x => ({
        ...x,
        results: results,
        state: 'EVALUATED'
      })
    );
  }

  public nextRound(starters: { leads: Id[], follows: Id[] }) {
    return this.currentRound.pipe(
      map(round => generateRound(round, starters)),
      switchMap(x => this.storageService.add('Round', x))
    );
  }
}
