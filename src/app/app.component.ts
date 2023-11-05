import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { filter, first, map, Observable, Subject, switchMap, tap } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { StorageService } from 'src/app/data/storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const toDataUrl = (data: Blob | Uint8Array): Observable<string> => {
  if (data instanceof Uint8Array) {
    data = new Blob([ data ]);
  }

  const fileReader = new FileReader();

  const subject = new Subject<string>();
  fileReader.addEventListener('load', () => {
    subject.next(fileReader.result as string);
    subject.complete();
  });
  fileReader.readAsDataURL(data);

  return subject.asObservable();
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'minicomp';

  @ViewChild('importInput', {read: ElementRef})
  public importInput: null | ElementRef = null;

  public importInputChanged = new Subject<null>();

  public constructor(
    @Inject(DOCUMENT) private document: Document,
    private snackBar: MatSnackBar,
    private storageService: StorageService) {
  }

  public export() {
    this.storageService.export().pipe(
      first(),
      tap(x => this.download(
        'data:application/json;base64,' + btoa(x),
        `minicomp-${(new Date()).toISOString()}.json`)),
      tap(() => this.snackBar.open('Database exported, check your downloads.', 'Dismiss', {
        duration: 4000
      }))
    ).subscribe();
  }

  public import() {
    this.importInput?.nativeElement.click();
    this.importInputChanged.pipe(
      first(),
      map(() => this.importInput?.nativeElement.files[0]),
      filter(x => x != null),
      switchMap(x => x.text() as string),
      switchMap(x => this.storageService.import(x)),
      tap(() => this.snackBar.open('Data import successful', 'Dismiss', {
        duration: 4000
      }))
    ).subscribe();
  }

  private download(data: Blob | string, name: string, options: { preferOpen?: boolean } = {}): void {
    if (name == null) {
      throw new Error('Filename for download must be given');
    }

    const preferOpen = 'preferOpen' in options ? options.preferOpen : false;

    if (typeof data === 'string') {
      this.setupLinkAndDownload(data, name, preferOpen ?? false);
    } else {
      toDataUrl(data).pipe(tap(strData => this.setupLinkAndDownload(strData, name, preferOpen ?? false))).subscribe();
    }
  }

  private setupLinkAndDownload(rawUrl: string, name: string, open: boolean) {
    const url = new URL(rawUrl);

    if (url.protocol !== 'data:') {
      throw new Error('Bad url');
    }

    if (open) {
      let helper = this.document.getElementById('app-open-helper') as HTMLAnchorElement;
      if (helper == null) {
        helper = this.document.createElement('a');
        helper.id = 'app-open-helper';
        helper.setAttribute('style', 'display: none');
        helper.setAttribute('target', '_blank');
        this.document.body.append(helper);
      }
      helper.href = url.toString();

      helper.click();

      helper.href = null as unknown as string;
    } else {
      let helper = this.document.getElementById('app-download-helper') as HTMLAnchorElement;
      if (helper == null) {
        helper = this.document.createElement('a');
        helper.id = 'app-download-helper';
        helper.setAttribute('style', 'display: none');
        this.document.body.append(helper);
      }

      helper.href = url.toString();
      helper.download = name;

      helper.click();

      helper.download = null as unknown as string;
      helper.href = null as unknown as string;
    }
  }
}
