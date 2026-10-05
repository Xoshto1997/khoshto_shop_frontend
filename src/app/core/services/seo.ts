import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://3dstudio.ge';

export interface SeoMetadata {
  title: string;
  description: string;
  noIndex?: boolean;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  public update(metadata: SeoMetadata, routePath: string): void {
    const canonicalUrl = this.getCanonicalUrl(routePath);
    const imageUrl = this.getAbsoluteUrl(metadata.image || '/3dstudio-back.jpg');
    const robots = metadata.noIndex ? 'noindex, nofollow' : 'index, follow';

    this.title.setTitle(metadata.title);
    this.meta.updateTag({ name: 'description', content: metadata.description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: metadata.title });
    this.meta.updateTag({ property: 'og:description', content: metadata.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:title', content: metadata.title });
    this.meta.updateTag({ name: 'twitter:description', content: metadata.description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    let canonicalLink = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.rel = 'canonical';
      this.document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }

  private getCanonicalUrl(routePath: string): string {
    const normalizedPath = routePath.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
    return this.getAbsoluteUrl(normalizedPath);
  }

  private getAbsoluteUrl(path: string): string {
    return new URL(path, SITE_URL).href;
  }
}
