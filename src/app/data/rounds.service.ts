import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, filter, first, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';
import { Couple, generateId, Participant, Result, Round } from 'src/app/data/model.base';
import { StorageService } from 'src/app/data/storage.service';

const drawCouples = (value: number[], participants: Participant[]): Couple[][] => {
  const leads = participants.filter(x => x.role == 'LEAD');
  const follows = participants.filter(x => x.role == 'FOLLOW');

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
  for (let heat = 0; heat < value.length; heat++) {
    returnValue.push([]);
    for (let couple = 0; couple < value[heat]; couple++) {
      returnValue[heat].push({
        id: generateId(),
        type: '',
        lead: leads[couple].id,
        follow: follows[couple].id,
      });
    }
  }

  return returnValue;
};

@Injectable({
  providedIn: 'root'
})
export class RoundsService {

  public readonly rounds: Observable<Round[]>;

  public readonly previousRound: Observable<Round>;

  constructor(private participantsService: ParticipantsService, private storageService: StorageService) {
    this.rounds = this.storageService.read('Round').pipe(
      map(x => x.sort(RoundsService.sort)),
      shareReplay(1)
    );

    this.previousRound = this.rounds.pipe(
      filter(x => x.length > 0),
      map(x => x[x.length - 1])
    );

    combineLatest([ this.participantsService.locked, this.rounds ]).pipe(
      switchMap(([ locked, rounds ]) => {
        if (!locked && rounds.length > 0) {
          return this.storageService.store('Round', []);
        } else if (locked && rounds.length == 0) {
          return this.participantsService.participants.pipe(
            first(),
            map(() => ({
              id: generateId(),
              type: 'Round',
              number: 0,
              state: 'DRAFT',
              heats: [],
              results: []
            }) as const),
            switchMap(round => this.storageService.store('Round', [round]))
          );
        } else {
          return EMPTY;
        }
      })).subscribe();
  }

  private static sort(round1: Round, round2: Round) {
    return round1.number - round2.number;
  }

  public canDraw(value: (null | number)[]): Observable<number> {
    return this.participantsService.locked.pipe(
      filter(x => x),
      switchMap(() => this.participantsService.participants),
      first(),
      map(participants => {
        const expected = value.reduce((p1, p2) => (p1 ?? 0) + (p2 ?? 0), 0);
        return (expected ?? 0) - participants.length / 2;
      })
    );
  }

  public suggestDraw(value: (null | number)[]): Observable<null> {
    return this.canDraw(value).pipe(
      switchMap(mismatch => {
        if (mismatch !== 0) {
          return throwError(() => mismatch);
        }

        return this.participantsService.participants;
      }),
      first(),
      switchMap(participants => {
        return this.storageService.edit('Round',
          x => x.state === 'DRAFT',
          x => ({
            ...x,
            heats: drawCouples(value.map(x => x ?? 0), participants)
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

  public evaluateRound(results: Result[]) {
    return this.storageService.edit('Round',
      x => x.state === 'STARTED',
      x => ({
        ...x,
        results: results.sort((r1, r2) => r2.points - r1.points),
        state: 'EVALUATED'
      })
    );
  }
}
