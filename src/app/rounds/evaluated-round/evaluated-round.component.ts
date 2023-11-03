import { Component, Input } from '@angular/core';
import { Id, Round, trackById } from 'src/app/data/model.base';
import { FormControl, Validators } from '@angular/forms';
import { RoundsService } from 'src/app/data/rounds.service';

@Component({
  selector: 'app-evaluated-round',
  templateUrl: './evaluated-round.component.html',
  styleUrls: [ './evaluated-round.component.scss' ]
})
export class EvaluatedRoundComponent {

  constructor(public roundsService: RoundsService) {
  }

  private _round: null | Round = null;

  public couplesKeptFormControl = new FormControl<null | number>(null,
    [ Validators.required, Validators.min(1), Validators.max(1) ]);

  public get round(): null | Round {
    return this._round;
  }

  @Input()
  public set round(value: null | Round) {
    if (this._round == value) return;

    this._round = value;
    this.couplesKeptFormControl = new FormControl<null | number>(null,
      [ Validators.required, Validators.min(1), Validators.max(value?.results.leads.length ?? 0) ]);
  }

  public get results() {
    if(this._round == null) throw new Error();

    return this._round.results;
  }

  public get invalid() {
    return this.couplesKeptFormControl.invalid;
  }


  public forStorage(): { leads: Id[], follows: Id[] } {
    if (this._round == null) {
      throw new Error();
    } else if (this.couplesKeptFormControl.value == null) {
      throw new Error();
    }

    return {
      leads: this._round.results.leads.slice(0, this.couplesKeptFormControl.value).map(x => x.id),
      follows: this._round.results.follows.slice(0, this.couplesKeptFormControl.value).map(x => x.id)
    };
  }

  public readonly id = trackById;

  public qualified(idx: number) {
    if (this._round?.state === 'EVALUATED')
      return idx < (this.couplesKeptFormControl.value ?? 0);
    else if (this._round?.state === 'SUPERSEEDED')
      return idx < (this._round.couplesKept ?? 0);
    return false;
  }
}
