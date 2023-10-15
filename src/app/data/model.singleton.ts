//
// Management
//

export interface SingletonTypeMap {
  State: State,
}

const SINGLETON_NAME_MAP = {
  State: 'State',
} as const;

export type SingletonType = keyof SingletonTypeMap
export const SINGLETON_TYPES: ReadonlyArray<SingletonType> = Object.values(SINGLETON_NAME_MAP);

//
// Actual models
//

export interface Singleton {
  type: SingletonType;
}

export type SingletonInput<T extends Singleton> = {
  type?: T['type'] | null | undefined;
} & {
  [P in keyof T]?: T[P] | null | undefined;
}


export interface State extends Singleton {
  type: typeof SINGLETON_NAME_MAP['State'];
  locked: boolean;
}
