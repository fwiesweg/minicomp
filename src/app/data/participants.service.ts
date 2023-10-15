import { Injectable } from '@angular/core';

import { BaseInput, generateId, Participant } from 'src/app/data/model.base';
import { combineLatest, first, map, Observable, switchMap, throwError } from 'rxjs';
import { StorageService } from 'src/app/data/storage.service';
import { State } from 'src/app/data/model.singleton';

@Injectable({
  providedIn: 'root'
})
export class ParticipantsService {

  private static sort(p1: Participant, p2: Participant) {
    let result: number;

    result = p1.firstName.localeCompare(p2.firstName);
    if(result !== 0) return result;

    result = p1.lastName.localeCompare(p2.lastName);
    if(result !== 0) return result;

    return p1.id.localeCompare(p2.id);
  }

  constructor(private storageService: StorageService) {
  }

  public get locked() {
    return this.storageService.readSingleton('State').pipe(
      map(state => state.locked));
  }

  public get participants() {
    return this.storageService.read('Participant');
  }

  private edit<T>(editFunction: ((state: State, participants: Participant[]) => Observable<T>)): Observable<T> {
    return combineLatest([
      this.storageService.readSingleton('State'),
      this.participants
    ]).pipe(first(), switchMap(([ state, participants ]) => {
      if(state.locked) throw new Error();

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
      participants.sort(ParticipantsService.sort)
      return this.storageService.store('Participant', participants)
    });
  }

  public removeParticipant(input: Participant): Observable<null> {
    return this.edit((state, participants) => {
      participants = participants.filter(x => x.id != input.id);
      participants.sort(ParticipantsService.sort)
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
    });
  }
}
