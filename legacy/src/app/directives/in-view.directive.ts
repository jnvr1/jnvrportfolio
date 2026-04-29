import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appInView]',
  standalone: true
})
export class InViewDirective implements OnInit, OnDestroy {
  @Input() inViewClass = 'in-view';
  @Input() rootMargin = '0px 0px -10% 0px';
  @Input() threshold = 0.1;

  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {}

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.r.addClass(this.el.nativeElement, this.inViewClass);
          } else {
            this.r.removeClass(this.el.nativeElement, this.inViewClass);
          }
        }
      }, { root: null, rootMargin: this.rootMargin, threshold: this.threshold });
      this.io.observe(this.el.nativeElement);
    } else {
      // No IO support, reveal by default
      this.r.addClass(this.el.nativeElement, this.inViewClass);
    }
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}

