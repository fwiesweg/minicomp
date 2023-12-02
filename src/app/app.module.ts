import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalStorageService, StorageService } from './data/storage.service';
import { ParticipantPipe } from './data/participant.pipe';
import { CurrentRoundsComponent } from './current-rounds/current-rounds.component';
import { ParticipantsComponent } from './participants/participants.component';
import { PreviousRoundsComponent } from './previous-rounds/previous-rounds.component';
import { DraftRoundComponent } from './shared/draft-round-component/draft-round.component';
import { EvaluatedRoundComponent } from './shared/evaluated-round/evaluated-round.component';
import { StartedRoundComponent } from './shared/started-round/started-round.component';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,

    CurrentRoundsComponent,
    ParticipantsComponent,
    PreviousRoundsComponent,

    DraftRoundComponent,
    EvaluatedRoundComponent,
    StartedRoundComponent,

    ParticipantPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,

    AppRoutingModule,
  ],
  providers: [ {
    provide: StorageService,
    useClass: LocalStorageService,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
