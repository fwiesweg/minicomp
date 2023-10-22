import { Component, Input } from '@angular/core';
import { Participant, Round, trackById } from 'src/app/data/model.base';

@Component({
  selector: 'app-evaluated-round',
  templateUrl: './evaluated-round.component.html',
  styleUrls: [ './evaluated-round.component.scss' ]
})
export class EvaluatedRoundComponent {

  private _round: null | Round = null;

  public get round(): null | Round {
    return this._round;
  }

  @Input()
  public set round(value: null | Round) {
    this._round = value;
  }

  public get results() {
    return this.round?.results ?? {
      leads: [],
      follows: []
    };
  }

  public get invalid() {
    return false;
  }


  public forStorage(): Participant[] {
    return [];
  }

  public readonly id = trackById;
}
