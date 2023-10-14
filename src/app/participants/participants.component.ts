import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ParticipantsService } from 'src/app/data/participants.service';
import { MatTable } from '@angular/material/table';
import { Id, Participant, ParticipantType, Role } from 'src/app/data/model';
import { filter, map, Subscription, tap } from 'rxjs';
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

  participantFormGroup = new FormGroup({
    id: new FormControl<null>(null),
    type: new FormControl<null>(null),
    firstName: new FormControl<null | string>(null, [ Validators.required ]),
    lastName: new FormControl<null | string>(null, [ Validators.required ]),
    role: new FormControl<null | Role>(null, [ Validators.required ])
  });
  subscription: Subscription = new Subscription();

  @ViewChild(MatTable)
  public table!: MatTable<Participant>;

  ngOnInit(): void {
    this.subscription.add(this.participantsService.participants.pipe(
      tap(() => this.table && this.table.renderRows())
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addParticipant() {
    this.participantsService.addParticipant(this.participantFormGroup.value);

    this.participantFormGroup.reset();
    this.participantFormGroup.markAsUntouched();
    this.participantFormGroup.markAsPristine();
    this.participantFormGroup.updateValueAndValidity()
  }

  lock() {
    this.participantsService.lock()
      .pipe(tap(error => {
        if(error == null) return;

        alert(error);
      }))
      .subscribe()
  }
}
