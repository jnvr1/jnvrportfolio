/* eslint-disable @angular-eslint/directive-selector */
import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[lazyImg]',
  standalone: true
})
export class LazyImgDirective implements OnInit, OnDestroy {
  @Input('lazyImg') src = '';
  @Input() alt?: string;

  private io?: IntersectionObserver;
  private el: HTMLImageElement;

  constructor(private ref: ElementRef<HTMLImageElement>, private r: Renderer2) {
    this.el = ref.nativeElement;
  }

  ngOnInit(): void {
    // Prepare element
    if (this.alt) this.r.setAttribute(this.el, 'alt', this.alt);
    this.r.setAttribute(this.el, 'decoding', 'async');
    this.r.setAttribute(this.el, 'loading', 'lazy');
    this.r.addClass(this.el, 'lazy-blur');

    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.load();
            this.io?.disconnect();
            break;
          }
        }
      }, { rootMargin: '200px 0px', threshold: 0.01 });
      this.io.observe(this.el);
    } else {
      this.load();
    }
  }

  private load() {
    const img = new Image();
    img.src = this.src;
    img.onload = () => {
      this.r.setAttribute(this.el, 'src', this.src);
      this.r.addClass(this.el, 'is-loaded');
    };
    img.onerror = () => {
      // Fallback to direct set to avoid blank images
      this.r.setAttribute(this.el, 'src', this.src);
      this.r.addClass(this.el, 'is-loaded');
    };
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
