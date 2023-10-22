import { Component, OnDestroy } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { delay, filter, map, of, Subscription, tap } from 'rxjs';
import { ParticipantsService } from 'src/app/data/participants.service';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss']
})
export class RoundsComponent implements OnDestroy {
  constructor(public participantsService: ParticipantsService, public roundsService: RoundsService) {
    this.subscription.add(this.nextRoundFormGroup.controls.heats.valueChanges.pipe(
      filter(x => x != null),
      map(x => x as number),
      delay(200),
      tap(x => {
        while (x > this.nextRoundFormGroup.controls.heatSizes.length) {
          this.nextRoundFormGroup.controls.heatSizes.push(new FormControl<number | null>(null, [ Validators.required ]));
        }

        while (x < this.nextRoundFormGroup.controls.heatSizes.length) {
          this.nextRoundFormGroup.controls.heatSizes.removeAt(this.nextRoundFormGroup.controls.heatSizes.length - 1);
        }
      })
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private subscription = new Subscription();

  public nextRoundFormGroup = new FormGroup({
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
}
