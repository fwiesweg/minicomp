//
// Management
//

export interface BaseTypeMap {
  '': never,
  Participant: Participant
  Round: Round,
}

export type BaseType = Exclude<keyof BaseTypeMap, ''>;


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
export const trackById = (idx: number, b: Base) => b.id;
export const trackByIdx = (idx: number, b: unknown) => idx;


export interface Base {
  id: Id;
  type: BaseType | '';
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

export interface ParticipantLead extends Participant {
  role: 'LEAD';
}

export interface ParticipantFollow extends Participant {
  role: 'FOLLOW';
}

export type RoundType = 'Round';
export type RoundState = 'DRAFT' | 'STARTED' | 'EVALUATED';

export interface Round extends Base {
  type: RoundType;
  number: number;

  state: RoundState
  heats: readonly Couple[][]
  results: Result
}

export interface Couple extends Base {
  type: '';

  lead: Id
  follow: Id
}

export interface Result {
  leads: readonly ParticipantResult[]
  follows: readonly ParticipantResult[]
}

export interface ParticipantResult extends Base {
  type: '',

  points: number;
}
