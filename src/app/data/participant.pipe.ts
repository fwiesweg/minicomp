import { Pipe, PipeTransform } from '@angular/core';
import { ParticipantsService } from 'src/app/data/participants.service';
import { Id } from 'src/app/data/model.base';

@Pipe({
  name: 'participant',
  pure: true
})
export class ParticipantPipe implements PipeTransform {

  constructor(private participantService: ParticipantsService) {
  }

  public transform(value: Id): string {
    const participant = this.participantService.forPipe(value);
    if (!participant) {
      return '?';
    }

    return `${participant.firstName} ${participant.lastName}`;
  }

}
