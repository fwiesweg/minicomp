import { Component } from '@angular/core';
import { RoundsService } from 'src/app/data/rounds.service';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.scss']
})
export class RoundsComponent {
  constructor(public roundsService: RoundsService) {
  }
}
