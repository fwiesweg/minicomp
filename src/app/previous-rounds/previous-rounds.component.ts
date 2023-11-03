import { Component } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { trackById } from 'src/app/data/model.base';
import { map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-rounds',
  templateUrl: './previous-rounds.component.html',
  styleUrls: [ './previous-rounds.component.scss' ]
})
export class PreviousRoundsComponent {
  public readonly noPreviousRounds: Observable<boolean>;

  constructor(public roundsService: RoundsService) {
    this.noPreviousRounds = this.roundsService.rounds.pipe(
      map(x => x.filter(x => x.state === 'SUPERSEEDED').length === 0),
      shareReplay(1),
    );
  }

  public readonly id = trackById;
}
