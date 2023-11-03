import { Component, Input, OnDestroy } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { Subscription } from 'rxjs';
import { Heat, Id, ParticipantResult, Round, trackById, trackByIdx } from 'src/app/data/model.base';
import { FormArray, FormControl, Validators } from '@angular/forms';

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
      this.formArray.push(new FormArray<FormControl<null | number>>([]));
    }

    for (let i = 0; i < this.formArray.length; i++) {
      const innerFormArray = this.formArray.at(i);
      while (innerFormArray.length < value.heats[i].couples.length) {
        innerFormArray.push(new FormControl<number>(0, [ Validators.required ]));
      }
    }

  }

  public readonly id = trackById;

  public readonly idx = trackByIdx;

  public readonly formArray = new FormArray<FormArray<FormControl<null | number>>>([]);

  public get heats(): readonly Heat[] {
    if (this.round == null) return [];
    else return this.round.heats;
  }

  public get invalid() {
    return this.formArray.invalid;
  }

  public forStorage() {
    if (this.round == null) throw Error();

    const leads = new Map<Id, ParticipantResult>();
    const follows = new Map<Id, ParticipantResult>();
    for (let i = 0; i < this.formArray.length; i++) {
      const innerFormArray = this.formArray.at(i);
      for (let j = 0; j < innerFormArray.length; j++) {
        const points = innerFormArray.at(j).value;
        if (points == null) throw Error();

        const leadId = this.round.heats[i].couples[j].lead;
        let lead = leads.get(leadId);
        if (lead == null) {
          lead = {
            id: this.round.heats[i].couples[j].lead,
            type: '',
            points: 0
          };
          leads.set(leadId, lead);
        }
        lead.points += points;

        const followId = this.round.heats[i].couples[j].follow;
        let follow = follows.get(followId);
        if (follow == null) {
          follow = {
            id: followId,
            type: '',
            points: 0
          };
          follows.set(followId, follow);
        }
        follow.points += points;
      }
    }

    return {
      leads: Array(...leads.values()).sort((r1, r2) => r2.points - r1.points),
      follows: Array(...follows.values()).sort((r1, r2) => r2.points - r1.points),
    };
  }
}
