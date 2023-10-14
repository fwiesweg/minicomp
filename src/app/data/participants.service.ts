import { Injectable } from '@angular/core';

import { BaseHelpers, BaseInput, Participant } from './model';
import { BehaviorSubject, first, map, Observable, Subject } from 'rxjs';

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

  private _locked = new BehaviorSubject<boolean>(false);
  private _participants = new BehaviorSubject<ReadonlyArray<Participant>>([ {
    id: BaseHelpers.generateId(),
    type: 'Participant',
    firstName: 'Florian',
    lastName: 'Wiesweg',
    role: 'LEAD',
  }, {
    id: BaseHelpers.generateId(),
    type: 'Participant',
    firstName: 'Michèle-Rose',
    lastName: 'Gorovoy',
    role: 'FOLLOW',
  } ]);

  public get locked() {
    return this._locked.asObservable();
  }

  public get participants() {
    return this._participants.asObservable();
  }

  public addParticipant(p: BaseInput<Participant> | null | undefined) {
    if(this._locked.value) {
      throw new Error();
    }

    if(p == null || p.firstName == null || p.lastName == null || p.role == null) {
      throw new Error()
    }

    const participants = [ ...this._participants.value, {
      ...p,
      id: BaseHelpers.generateId(),
      type: 'Participant',
    } as Required<Participant> ]
    participants.sort(ParticipantsService.sort)
    this._participants.next(participants);
  }

  public removeParticipant(p: Participant) {
    if(this._locked.value) {
      throw new Error();
    }

    this._participants.next(this._participants.value
      .filter(x => x.id != p.id));
  }

  public lock(): Observable<null | string> {
    return this._participants.pipe(
      first(),
      map(value => {
        const numLead = value.filter(p => p.role == 'LEAD').length;
        const numFollow = value.filter(p => p.role == 'FOLLOW').length;

        const error = numLead == numFollow ? null : 'Could not lock competition: unequal distribution of roles.';

        if(error == null) {
          this._locked.next(true);
        }

        return error;
      })
    )
  }
}
