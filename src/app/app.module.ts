import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ParticipantsComponent } from './participants/participants.component';
import { RoundsComponent } from './rounds/rounds.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LocalStorageService, StorageService } from 'src/app/data/storage.service';
import { DraftRoundComponent } from 'src/app/rounds/draft-round-component/draft-round.component';
import { StartedRoundComponent } from 'src/app/rounds/started-round/started-round.component';

@NgModule({
  declarations: [
    AppComponent,
    ParticipantsComponent,
    RoundsComponent,
    DraftRoundComponent,
    StartedRoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [ {
    provide: StorageService,
    useClass: LocalStorageService,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
