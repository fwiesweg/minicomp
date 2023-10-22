import { Component, Input, OnDestroy } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { delay, filter, map, of, Subscription, tap } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Couple, Round, trackById, trackByIdx } from 'src/app/data/model.base';

@Component({
  selector: 'app-draft-round-component',
  templateUrl: './draft-round.component.html',
  styleUrls: [ './draft-round.component.scss' ]
})
export class DraftRoundComponent implements OnDestroy {

  constructor(public roundsService: RoundsService) {
    this.subscription.add(this.formGroup.controls.heats.valueChanges.pipe(
      filter(x => x != null),
      map(x => x as number),
      delay(200),
      tap(x => {
        while (x > this.formGroup.controls.heatSizes.length) {
          this.formGroup.controls.heatSizes.push(new FormControl<number | null>(null, [ Validators.required ]));
        }

        while (x < this.formGroup.controls.heatSizes.length) {
          this.formGroup.controls.heatSizes.removeAt(this.formGroup.controls.heatSizes.length - 1);
        }
      })
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private readonly subscription = new Subscription();

  public readonly formGroup = new FormGroup({
    heats: new FormControl<null | number>(null, [ Validators.required ]),
    heatSizes: new FormArray<FormControl<null | number>>([])
  }, null, [ fg => {
    const heatSizes = fg.get('heatSizes') as FormArray<FormControl<null | number>>;
    if (heatSizes.length == 0) {
      return of({'heatsize-missing': 'no-elements'});
    } else if (heatSizes.value.findIndex(x => x == null) >= 0) {
      return of({'heatsize-missing': 'found-null'});
    }

    return this.roundsService.canDraw(heatSizes.value as number[]).pipe(
      map(mismatch => mismatch === 0 ? null : {
        'heatsize-mismatch': mismatch
      })
    );
  } ]);

  @Input()
  public round: null | Round = null;

  public readonly id = trackById;

  public readonly idx = trackByIdx;

  public get heats(): readonly Couple[][] {
    if (this.round == null) return [];
    else return this.round.heats;
  }

  public get invalid() {
    return this.formGroup.invalid;
  }

  public get heatSizes() {
    return this.formGroup.controls.heatSizes.value;
  }
}
