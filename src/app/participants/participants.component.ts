import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ParticipantsService } from 'src/app/data/participants.service';
import { MatTable } from '@angular/material/table';
import { Id, Participant, Role, trackById } from 'src/app/data/model.base';
import { map, Subscription, tap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: [ './participants.component.scss' ]
})
export class ParticipantsComponent implements OnDestroy, OnInit {
  constructor(public participantsService: ParticipantsService) {
  }

  public get displayedColumns() {
    return this.participantsService.locked.pipe(
      map(locked => locked
        ? [ 'firstName', 'lastName', 'role' ]
        : [ 'firstName', 'lastName', 'role', 'actions' ]
      )
    )
  }

  public drawnParticipants: Id[] = [];
  public participantFormGroup = new FormGroup({
    id: new FormControl<null>(null),
    type: new FormControl<null>(null),
    firstName: new FormControl<null | string>(null, [ Validators.required ]),
    lastName: new FormControl<null | string>(null, [ Validators.required ]),
    role: new FormControl<null | Role>(null, [ Validators.required ])
  });
  private subscription: Subscription = new Subscription();

  @ViewChild(MatTable)
  public table!: MatTable<Participant>;

  public readonly id = trackById;

  public ngOnInit(): void {
    this.subscription.add(this.participantsService.participants.pipe(
      tap(() => this.table && this.table.renderRows())
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public addParticipant() {
    this.participantsService.addParticipant(this.participantFormGroup.value).subscribe();

    this.participantFormGroup.reset();
    this.participantFormGroup.markAsUntouched();
    this.participantFormGroup.markAsPristine();
    this.participantFormGroup.updateValueAndValidity()

    this.drawnParticipants = [];
  }

  public removeParticipant(participant: Participant) {
    this.participantsService.removeParticipant(participant).subscribe();

    this.drawnParticipants = [];
  }

  public drawParticipants() {
    this.participantsService.drawParticipants().subscribe(x => this.drawnParticipants = [ x[0] ]);
  }
}
