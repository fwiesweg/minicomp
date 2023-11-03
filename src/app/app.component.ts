import { Component, Inject } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { DOCUMENT } from '@angular/common';

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
  title = 'minicomp';

  public constructor(@Inject(DOCUMENT) private document: Document) {
  }

  public export() {


  }

  private download(data: Blob | string, name: string, options: { preferOpen?: boolean } = {}): void {
    if (name == null) {
      throw new Error('Filename for download must be given');
    }

    const preferOpen = 'preferOpen' in options ? options.preferOpen : false;

    if (typeof data === 'string')
      this.setupLinkAndDownload(data, name, preferOpen ?? false);
    else
      toDataUrl(data).pipe(tap(strData => this.setupLinkAndDownload(strData, name, preferOpen ?? false))).subscribe();
  }

  private setupLinkAndDownload(rawUrl: string, name: string, open: boolean) {
    const url = new URL(rawUrl);

    if (url.protocol !== 'data:') {
      throw new Error('Bad url');
    }

    if (open) {
      let helper = this.document.getElementById('isa-open-helper') as HTMLAnchorElement;
      if (helper == null) {
        helper = this.document.createElement('a');
        helper.id = 'isa-open-helper';
        helper.setAttribute('style', 'display: none');
        helper.setAttribute('target', '_blank');
        this.document.body.append(helper);
      }
      helper.href = url.toString();

      helper.click();

      helper.href = null as unknown as string;
    } else {
      let helper = this.document.getElementById('isa-download-helper') as HTMLAnchorElement;
      if (helper == null) {
        helper = this.document.createElement('a');
        helper.id = 'isa-download-helper';
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
