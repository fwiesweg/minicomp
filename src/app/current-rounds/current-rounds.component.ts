import { Component } from '@angular/core';
import { ParticipantsService } from 'src/app/data/participants.service';
import { RoundsService } from 'src/app/data/rounds.service';
import { trackById } from 'src/app/data/model.base';
import { map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-rounds',
  templateUrl: './current-rounds.component.html',
  styleUrls: ['./current-rounds.component.scss']
})
export class CurrentRoundsComponent {
  public readonly noCurrentRounds: Observable<boolean>;

  constructor(public participantsService: ParticipantsService, public roundsService: RoundsService) {
    this.noCurrentRounds = roundsService.rounds.pipe(
      map(x => x.filter(y => y.state !== 'SUPERSEDED').length === 0),
      shareReplay(1)
    )
  }

  public readonly id = trackById;
}
