import { Component, OnDestroy } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { delay, filter, map, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss']
})
export class RoundsComponent implements OnDestroy {
  constructor(public roundsService: RoundsService) {

    this.subscription.add(this.nextRoundFormGroup.controls.heats.valueChanges.pipe(
      filter(x => x != null),
      map(x => x as number),
      delay(200),
      tap(x => {
        console.log(x);
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
  });
}
