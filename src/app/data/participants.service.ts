import { Injectable, OnDestroy } from '@angular/core';

import { BaseInput, generateId, generateRound, Id, Participant } from 'src/app/data/model.base';
import { combineLatest, first, map, Observable, shareReplay, Subscription, switchMap, tap, throwError } from 'rxjs';
import { StorageService } from 'src/app/data/storage.service';
import { State } from 'src/app/data/model.singleton';
import { shuffle } from 'src/app/shared/util';

@Injectable({
  providedIn: 'root'
})
export class ParticipantsService implements OnDestroy {
  private static sort(p1: Participant, p2: Participant) {
    let result: number;

    result = p1.firstName.localeCompare(p2.firstName);
    if(result !== 0) return result;

    result = p1.lastName.localeCompare(p2.lastName);
    if(result !== 0) return result;

    return p1.id.localeCompare(p2.id);
  }

  private participantCache: Map<Id, Participant> = new Map();

  private subscription = new Subscription();

  public readonly balance: Observable<number>;
  public readonly locked: Observable<boolean>;
  public readonly participants: Observable<Participant[]>;
  public readonly unlocked: Observable<boolean>;

  constructor(private storageService: StorageService) {
    this.locked = this.storageService.readSingleton('State').pipe(
      map(state => state.locked), shareReplay(1));
    this.unlocked = this.locked.pipe(map(x => !x), shareReplay(1));
    this.participants = this.storageService.read('Participant').pipe(
      map(x => x.sort(ParticipantsService.sort)),
      shareReplay(1)
    );
    this.balance = this.participants.pipe(
      map(x => (
        x.filter(x => x.role === 'LEAD').length - x.filter(x => x.role === 'FOLLOW').length
      )),
      shareReplay(1)
    );

    this.subscription.add(combineLatest([ this.locked, this.participants ]).pipe(
      map(([ locked, participants ]) => {
        if (!locked) return new Map();

        const map = new Map();
        for (const p of participants) {
          map.set(p.id, p);
        }

        return map;
      }),
      tap(x => this.participantCache = x)
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }



  private edit<T>(editFunction: ((state: State, participants: Participant[]) => Observable<T>), allowLocked: boolean = false): Observable<T> {
    return combineLatest([
      this.storageService.readSingleton('State'),
      this.participants
    ]).pipe(first(), switchMap(([ state, participants ]) => {
      if(!allowLocked && state.locked) throw new Error();

      return editFunction(state, participants);
    }));
  }

  public addParticipant(input: BaseInput<Participant> | null | undefined): Observable<null> {
    return this.edit((state, participants) => {
      participants = [ ...participants, {
        ...input,
        id: generateId(),
        type: 'Participant',
      } as Required<Participant> ]
      participants.sort(ParticipantsService.sort);
      return this.storageService.store('Participant', participants);
    });
  }

  public removeParticipant(input: Participant): Observable<null> {
    return this.edit((state, participants) => {
      participants = participants.filter(x => x.id != input.id);
      return this.storageService.store('Participant', participants);
    });
  }

  public lock(): Observable<null> {
    return this.edit((state, participants) => {
      const numLead = participants.filter(p => p.role == 'LEAD').length;
      const numFollow = participants.filter(p => p.role == 'FOLLOW').length;

      if(numLead != numFollow) {
        return throwError(() => 'Could not lock competition: unequal distribution of roles.');
      }

      return this.storageService.storeSingleton('State', {
        ...state,
        locked: true
      });
    }).pipe(
      switchMap(() => this.participants),
      first(),
      map(p => generateRound(1, {
        leads: p.filter(x => x.role === 'LEAD').map(x => x.id),
        follows: p.filter(x => x.role === 'FOLLOW').map(x => x.id)
      })),
      switchMap(round => this.storageService.store('Round', [ round ]))
    );
  }

  public unlock(): Observable<null> {
    return this.edit((state, participants) => this.storageService.storeSingleton('State', {
      ...state,
      locked: false
    }), true).pipe(
      switchMap(() => this.storageService.store('Round', []))
    );
  }

  public forPipe(participantId: Id) {
    return this.participantCache.get(participantId);
  }

  public drawParticipants(): Observable<Id[]> {
    return combineLatest([
      this.balance, this.participants
    ]).pipe(
      first(),
      map(([ balance, participants ]) => {
        const candidates = balance > 0
          ? participants.filter(x => x.role === 'LEAD')
          : participants.filter(x => x.role === 'FOLLOW');
        shuffle(candidates);

        return candidates.filter(
          (_, idx) => idx < Math.abs(balance)
        ).map(x => x.id);
      })
    );
  }
}
