import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, filter, first, map, Observable, shareReplay, switchMap } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';
import { generateId, Round } from 'src/app/data/model.base';
import { StorageService } from 'src/app/data/storage.service';

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
            map(p => ({
              id: generateId(),
              type: 'Round',
              number: 0,
              state: 'DRAFT',
              heats: []
            }) as const),
            switchMap(round => this.storageService.store('Round', [round]))
          );
        } else {
          return EMPTY;
        }
      }));
  }

  private static sort(round1: Round, round2: Round) {
    return round1.number - round2.number;
  }

  public get active(): Observable<boolean> {
    return this.participantsService.locked;
  }
}
