import { Injectable, OnDestroy } from '@angular/core';
import { BASE_TYPES, BaseType, BaseTypeMap, Participant, Round } from 'src/app/data/model.base';
import { BehaviorSubject, EMPTY, first, forkJoin, fromEvent, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { SINGLETON_TYPES, SingletonType, SingletonTypeMap, State } from 'src/app/data/model.singleton';

interface DataExport {
  type: 'base' | 'singleton';
  model: string;
  data: object;
}


export abstract class StorageService {

  public abstract read<T extends BaseType>(model: T): Observable<BaseTypeMap[T][]>;

  public abstract store<T extends BaseType>(model: T, data: BaseTypeMap[T][]): Observable<null>;

  public edit<T extends BaseType>(model: T,
                                  filter: (data: BaseTypeMap[T]) => boolean,
                                  edit: (data: BaseTypeMap[T]) => BaseTypeMap[T]) {
    return this.read(model).pipe(
      first(),
      map(x => x.map(y => {
        return filter(y) ? edit(y) : y;
      })),
      switchMap(x => this.store(model, x))
    );
  }

  public add<T extends BaseType>(model: T, data: BaseTypeMap[T]): Observable<null> {
    return this.read(model).pipe(
      first(),
      map(x => x.concat([ data ])),
      switchMap(x => this.store(model, x))
    );
  }

  public abstract readSingleton<T extends SingletonType>(model: T): Observable<SingletonTypeMap[T]>;

  public abstract storeSingleton<T extends SingletonType>(model: T, data: SingletonTypeMap[T]): Observable<null>;

  public export(): Observable<string> {
    const obsBase: Observable<DataExport>[] = BASE_TYPES.map(model => this.read(model).pipe(
      map(data => ({
        type: 'base' as const,
        model: model,
        data: data
      }))
    ));

    const obsSingleton: Observable<DataExport>[] = SINGLETON_TYPES.map(model => this.readSingleton(model).pipe(
      map(data => ({
        type: 'singleton' as const,
        model: model,
        data: data
      }))
    ));

    return forkJoin(obsBase.concat(obsSingleton)).pipe(
      map(x => JSON.stringify(x))
    );
  }

  public import(data: string): Observable<null> {
    const input = JSON.parse(data);
    if (!Array.isArray(input)) {
      throw new Error('No array');
    }

    const obs: Observable<unknown>[] = [];

    for (const elementAny of input) {
      const element = elementAny as DataExport;
      if (element.type === 'base') {
        obs.push(this.store(element.model as BaseType, element.data as any));
      } else if (element.type === 'singleton') {
        obs.push(this.storeSingleton(element.model as SingletonType, element.data as any));
      }
    }

    return forkJoin(obs).pipe(map(() => null));
  }
}


type BaseSubjects = { [key in BaseType]: BehaviorSubject<BaseTypeMap[key][]> };
type SingletonSubjects = { [key in SingletonType]: BehaviorSubject<SingletonTypeMap[key]> };

@Injectable({
  providedIn: 'root'
})
export class BehaviorSubjectStorageService extends StorageService {

  private baseSubjects: BaseSubjects = {
    Participant: new BehaviorSubject<Participant[]>([]),
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

  public readSingleton<T extends SingletonType>(model: T): Observable<SingletonTypeMap[T]> {
    return this.singletonSubjects[model].asObservable();
  }

  public storeSingleton<T extends SingletonType>(model: T, data: SingletonTypeMap[T]): Observable<null> {
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

const BASE_PREFIX = 'BASE_';
const SINGLETON_PREFIX = 'SINGLETON_';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService extends BehaviorSubjectStorageService implements OnDestroy {


  constructor() {
    super();

    // this is racy, but I'm too lazy to implement it properly

    this.subscription.add(fromEvent(window, 'storage').pipe(
      switchMap(e => {
        const event = e as StorageEvent;
        return this.loadData(event.key, event.newValue);
      })
    ).subscribe());

    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key == null) {
        continue;
      }

      this.loadData(key, localStorage.getItem(key)).subscribe();
    }
  }

  private subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(key: string | null, value: string | null) {
    if(key == null || value == null) {
      return EMPTY;
    }

    if(key.startsWith(BASE_PREFIX)) {
      const model = key.substring(BASE_PREFIX.length) as BaseType;
      if(!BASE_TYPES.includes(model)) {
        return EMPTY;
      }

      return this.store(model, JSON.parse(value));
    } else if(key.startsWith(SINGLETON_PREFIX)) {
      const model = key.substring(SINGLETON_PREFIX.length) as SingletonType;
      if(!SINGLETON_TYPES.includes(model)) {
        return EMPTY;
      }

      return this.storeSingleton(model, JSON.parse(value));
    } else {
      return EMPTY;
    }
  }

  public override store<T extends BaseType>(model: T, data: BaseTypeMap[T][]): Observable<null> {
    localStorage.setItem(BASE_PREFIX + model, JSON.stringify(data));
    return super.store(model, data);
  }

  public override storeSingleton<T extends SingletonType>(model: T, data: SingletonTypeMap[T]): Observable<null> {
    localStorage.setItem(SINGLETON_PREFIX + model, JSON.stringify(data));
    return super.storeSingleton(model, data);
  }
}


