import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParticipantsComponent } from 'src/app/participants/participants.component';
import { RoundsComponent } from 'src/app/rounds/rounds.component';

const routes: Routes = [ {
  path: 'participants',
  component: ParticipantsComponent,
}, {
  path: 'rounds',
  component: RoundsComponent,
} ];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
