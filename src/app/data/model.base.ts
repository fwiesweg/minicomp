//
// Management
//

export interface BaseTypeMap {
  Participant: Participant
  Round: Round,
}

export type BaseType = keyof BaseTypeMap


const BASE_NAME_MAP = {
  Participant: 'Participant',
  Round: 'Round',
} as const;
export const BASE_TYPES: ReadonlyArray<BaseType> = Object.values(BASE_NAME_MAP);

//
// Actual models
//

export type Id = string;
export const generateId = () => crypto.randomUUID();


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
