import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrentRoundsComponent } from 'src/app/current-rounds/current-rounds.component';
import { PreviousRoundsComponent } from 'src/app/previous-rounds/previous-rounds.component';
import { ParticipantsComponent } from 'src/app/participants/participants.component';

const routes: Routes = [ {
  path: 'participants',
  component: ParticipantsComponent,
}, {
  path: 'current-rounds',
  component: CurrentRoundsComponent,
}, {
  path: 'previous-rounds',
  component: PreviousRoundsComponent,
}, {
  path: '**',
  redirectTo: 'participants'
} ];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
