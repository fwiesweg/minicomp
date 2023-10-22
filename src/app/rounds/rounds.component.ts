import { Component } from '@angular/core';
import { ParticipantsService } from 'src/app/data/participants.service';
import { RoundsService } from 'src/app/data/rounds.service';
import { trackById } from 'src/app/data/model.base';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss']
})
export class RoundsComponent {
  constructor(public participantsService: ParticipantsService, public roundsService: RoundsService) {
  }

  public readonly id = trackById;
}
