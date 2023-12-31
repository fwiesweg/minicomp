import { Injectable, OnDestroy } from '@angular/core';
import { filter, first, map, Observable, shareReplay, Subscription, switchMap, throwError } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';
import { Couple, Dance, generateId, generateRound, Heat, Id, ParticipantResult, Round } from 'src/app/data/model.base';
import { StorageService } from 'src/app/data/storage.service';
import { shuffle } from 'src/app/shared/util';

const drawCouples = (value: number[], leads: Id[], follows: Id[]): Couple[][] => {
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
        follow: follows[couple],
        points: 0
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

  public canDraw(value: ReadonlyArray<number>): Observable<number> {
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

  public suggestDraw(dances: ReadonlyArray<Dance>, value: ReadonlyArray<number>): Observable<null> {
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
            heats: dances.flatMap(dance => {
              const couples = drawCouples(value.map(x => x ?? 0),
                round.results.leads.map(x => x.id),
                round.results.follows.map(x => x.id)
              );

              return couples.map((cpls, idx) => ({
                id: generateId(),
                type: '',
                couples: cpls,
                dance: dance,
                number: idx + 1
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

  public evaluateRound(round: Round) {
    return this.storageService.edit('Round',
      x => x.id === round.id,
      x => {
        const leads = new Map<Id, ParticipantResult>();
        const follows = new Map<Id, ParticipantResult>();
        for (let i = 0; i < x.heats.length; i++) {
          const couples = x.heats[i].couples;
          for (let j = 0; j < couples.length; j++) {
            const couple = couples[j];

            let lead = leads.get(couple.lead);
            if (lead == null) {
              lead = {
                id: couple.lead,
                type: '',
                points: 0
              };
              leads.set(couple.lead, lead);
            }
            lead.points += couple.points;

            let follow = follows.get(couple.follow);
            if (follow == null) {
              follow = {
                id: couple.follow,
                type: '',
                points: 0
              };
              follows.set(couple.follow, follow);
            }
            follow.points += couple.points;
          }
        }

        return ({
          ...x,
          results: {
            leads: Array(...leads.values()).sort((r1, r2) => r2.points - r1.points),
            follows: Array(...follows.values()).sort((r1, r2) => r2.points - r1.points)
          },
          state: 'EVALUATED'
        });
      }
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

  public addPoints(round: Round, heat: Heat, result: Couple[]) {
    return this.storageService.edit('Round', x => x.id === round.id,
      r => ({
        ...r,
        heats: round.heats.map(ih => {
          if (ih.id !== heat.id) return ih;

          if (!result.reduce((prev, couple) => {
            for (const ic of ih.couples) {
              if (ic.id === couple.id) {
                ic.points += couple.points;
                return true;
              }
            }

            return false;
          }, false)) {
            console.error('Inconsistent result');
            throw new Error('Inconsistent result');
          }

          return ih;
        })
      }));
  }
}
