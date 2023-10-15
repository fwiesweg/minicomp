import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';

@Injectable({
  providedIn: 'root'
})
export class RoundsService {

  constructor(private participantsService: ParticipantsService) {
  }

  public get active(): Observable<boolean> {
    return this.participantsService.locked;
  }
}
