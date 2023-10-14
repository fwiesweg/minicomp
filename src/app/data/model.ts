export type Id = string;

export class BaseHelpers {

  public static generateId(): Id {
    return crypto.randomUUID();
  }

}

export type BaseType = ParticipantType | RoundType;

export interface Base {
  id: Id;
  type: BaseType;
}


export type BaseInput<T extends Base> = {
  id?: null | undefined;
  type?: T['type'] | null | undefined;
} & {
  [P in keyof T]?: T[P] | null | undefined;
}


export type ParticipantType = 'Participant';
export type Role = 'LEAD' | 'FOLLOW';

export interface Participant extends Base {
  type: ParticipantType;

  firstName: string;
  lastName: string

  role: Role
}

export type RoundType = 'Round';

export interface Round extends Base {
  type: RoundType;

  name: string;

}
