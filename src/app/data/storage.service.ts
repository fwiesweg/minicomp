import { Injectable } from '@angular/core';
import { Base, BASE_TYPES, BaseType, BaseTypeMap, generateId, Participant, Round } from 'src/app/data/model.base';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { SingletonType, SingletonTypeMap, State } from 'src/app/data/model.singleton';


export abstract class StorageService {

  public abstract read<T extends BaseType>(model: T): Observable<BaseTypeMap[T][]>;

  public abstract store<T extends BaseType>(model: T, data: BaseTypeMap[T][]): Observable<null>;

  public abstract readSingleton<T extends SingletonType>(model: T): Observable<SingletonTypeMap[T]>;

  public abstract storeSingleton<T extends SingletonType>(model: T, data: SingletonTypeMap[T]): Observable<null>;

}

type BaseSubjects = { [key in BaseType]: BehaviorSubject<BaseTypeMap[key][]> };
type SingletonSubjects = { [key in SingletonType]: BehaviorSubject<SingletonTypeMap[key]> };

@Injectable({
  providedIn: 'root'
})
export class BehaviorSubjectStorageService extends StorageService {

  private baseSubjects: BaseSubjects = {
    Participant: new BehaviorSubject<Participant[]>([ {
      id: generateId(),
      type: 'Participant',
      firstName: 'Florian',
      lastName: 'Wiesweg',
      role: 'LEAD',
    }, {
      id: generateId(),
      type: 'Participant',
      firstName: 'Michèle-Rose',
      lastName: 'Gorovoy',
      role: 'FOLLOW',
    } ]),
    Round: new BehaviorSubject<Round[]>([] as Round[]),
  }

  private singletonSubjects: SingletonSubjects = {
    State: new BehaviorSubject<State>({
      type: 'State',
      locked: false,
    })
  }

  public read<T extends BaseType>(model: T): Observable<BaseTypeMap[T][]> {
    return this.baseSubjects[model].asObservable();
  }

  public store<T extends BaseType>(model: T, data: BaseTypeMap[T][]): Observable<null> {
    return of(null).pipe(
      tap(() => {
        for(const el of data) {
          if(el.type != model) {
            throw new Error();
          }
        }

        this.baseSubjects[model].next(data);
      })
    )
  }

  readSingleton<T extends SingletonType>(model: T): Observable<SingletonTypeMap[T]> {
    return this.singletonSubjects[model].asObservable();
  }

  storeSingleton<T extends SingletonType>(model: T, data: SingletonTypeMap[T]): Observable<null> {
    return of(null).pipe(
      tap(() => {
        if(data.type != model) {
          throw new Error();
        }

        this.singletonSubjects[model].next(data);
      })
    )
  }
}
