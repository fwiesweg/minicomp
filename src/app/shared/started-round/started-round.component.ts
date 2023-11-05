import { Component, Input, OnDestroy } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { map, Observable, of, Subscription, switchMap } from 'rxjs';
import { Couple, Heat, Round, trackById, trackByIdx } from 'src/app/data/model.base';
import { FormArray, FormControl, Validators } from '@angular/forms';

type OutputType = null | 0 | true;

@Component({
  selector: 'app-started-round-component',
  templateUrl: './started-round.component.html',
  styleUrls: [ './started-round.component.scss' ]
})
export class StartedRoundComponent implements OnDestroy {

  constructor(public roundsService: RoundsService) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private readonly subscription = new Subscription();

  private _round: null | Round = null;

  public get round(): null | Round {
    return this._round;
  }

  @Input()
  public set round(value: null | Round) {
    if (this.round == value) {
      return;
    }

    this._round = value;
    this.formArray.clear();
    if (value == null) {
      return;
    }

    while (this.formArray.length < value.heats.length) {
      this.formArray.push(new FormArray<FormControl<OutputType>>([]));
    }

    for (let i = 0; i < this.formArray.length; i++) {
      const innerFormArray = this.formArray.at(i);
      while (innerFormArray.length < value.heats[i].couples.length) {
        innerFormArray.push(new FormControl<OutputType>(0, [ Validators.required ]));
      }
    }

  }

  public readonly id = trackById;

  public readonly idx = trackByIdx;

  public readonly formArray = new FormArray<FormArray<FormControl<OutputType>>>([]);

  public get heats(): readonly Heat[] {
    if (this.round == null) return [];
    else return this.round.heats;
  }

  public get hasMarks() {
    return this.formArray.value.some(x => x.some(y => y === true));
  }

  public addPoints() {
    const round = this.round;
    if (round == null) throw Error();

    let obs: Observable<null> = of(null);
    for (let i = 0; i < this.formArray.length; i++) {
      const result: Couple[] = [];
      const innerFormArray = this.formArray.at(i);
      for (let j = 0; j < innerFormArray.length; j++) {
        const couple = round.heats[i].couples[j];
        if (!innerFormArray.at(j).value) {
          continue;
        }

        result.push({
          ...couple,
          points: 1
        });
      }

      if (result.every(c => c.points === 0)) {
        continue;
      }

      obs = obs.pipe(switchMap(() => this.roundsService.addPoints(round, round.heats[i], result)));
    }

    return obs.pipe(map(() => null));
  }
}
