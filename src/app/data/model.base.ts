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

export type Dance = string;
export type RoundType = 'Round';
export type RoundState = 'DRAFT' | 'STARTED' | 'EVALUATED' | 'SUPERSEDED';

export interface Round extends Base {
  type: RoundType;
  number: number;

  state: RoundState
  heats: readonly Heat[]
  results: Result
  couplesKept: null | number;
}

export interface Heat extends Base {
  type: '';

  dance: Dance;
  couples: Couple[];
  number: number;
}

export interface Couple extends Base {
  type: '';

  lead: Id;
  follow: Id;
  points: number;
}

export interface Result {
  leads: readonly ParticipantResult[]
  follows: readonly ParticipantResult[]
}

export interface ParticipantResult extends Base {
  type: '';

  points: number;
}


export const generateRound = (roundNumber: number, starters: { leads: Id[], follows: Id[] }): Round => {
  if (starters.leads.length !== starters.follows.length) throw new Error('Unbalanced starters');

  return {
    id: generateId(),
    type: 'Round',
    number: roundNumber,
    state: 'DRAFT',
    heats: [],
    results: {
      leads: starters.leads.map(x => ({
        id: x,
        type: '' as const,
        points: 0
      })),
      follows: starters.follows.map(x => ({
        id: x,
        type: '' as const,
        points: 0
      }))
    },
    couplesKept: null
  };
};
