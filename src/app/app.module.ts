import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ParticipantsComponent } from './participants/participants.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LocalStorageService, StorageService } from 'src/app/data/storage.service';
import { DraftRoundComponent } from 'src/app/shared/draft-round-component/draft-round.component';
import { EvaluatedRoundComponent } from 'src/app/shared/evaluated-round/evaluated-round.component';
import { StartedRoundComponent } from 'src/app/shared/started-round/started-round.component';
import { PreviousRoundsComponent } from 'src/app/previous-rounds/previous-rounds.component';
import { CurrentRoundsComponent } from 'src/app/current-rounds/current-rounds.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AppComponent,

    CurrentRoundsComponent,
    ParticipantsComponent,
    PreviousRoundsComponent,

    DraftRoundComponent,
    EvaluatedRoundComponent,
    StartedRoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTableModule,

    MatToolbarModule,
    AppRoutingModule
  ],
  providers: [ {
    provide: StorageService,
    useClass: LocalStorageService,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
