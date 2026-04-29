import { animation, trigger, transition, style, animate, query, stagger, keyframes, useAnimation, group } from '@angular/animations';

// Easing por defecto alineado al sistema de diseño
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

// 1) fadeInUp con delay escalonado
export const fadeInUpStaggerAnim = animation([
  query(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    stagger('90ms', [
      animate('{{duration}} {{easing}}', style({ opacity: 1, transform: 'none' }))
    ])
  ], { optional: true })
], { params: { duration: '600ms', easing: EASE } });

export const fadeInUpStagger = trigger('fadeInUpStagger', [
  transition(':enter, * => *', [ useAnimation(fadeInUpStaggerAnim) ])
]);

// 2) drawLine (para líneas SVG)
// Aplica sobre elementos <line>, <path>, etc. con stroke configurado.
export const drawLineAnim = animation([
  style({
    strokeDasharray: '{{length}}',
    strokeDashoffset: '{{length}}'
  }),
  animate('{{duration}} {{easing}}', style({ strokeDashoffset: 0 }))
], { params: { length: 1000, duration: '1000ms', easing: EASE } });

export const drawLine = trigger('drawLine', [
  transition(':enter', [ useAnimation(drawLineAnim) ])
]);

// 3) nodesPulse (nodos que pulsan suavemente)
export const nodesPulseAnim = animation([
  animate('{{duration}} {{easing}}', keyframes([
    style({ transform: 'scale(1)', offset: 0 }),
    style({ transform: 'scale(1.06)', offset: 0.5 }),
    style({ transform: 'scale(1)', offset: 1 })
  ]))
], { params: { duration: '1200ms', easing: EASE } });

export const nodesPulse = trigger('nodesPulse', [
  transition(':enter', [ useAnimation(nodesPulseAnim) ]),
  transition('* => *', [ useAnimation(nodesPulseAnim) ])
]);

// 4) clipPathReveal (tarjetas geométricas)
export const clipPathRevealAnim = animation([
  style({ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }),
  animate('{{duration}} {{easing}}',
    style({ clipPath: '{{clipFinal}}' })
  )
], {
  params: {
    duration: '700ms',
    easing: EASE,
    // Corte diagonal tipo tarjeta geométrica JNVR (usa --cut si está definido en CSS)
    clipFinal: 'polygon(0 0, calc(100% - var(--cut, 24px)) 0, 100% var(--cut, 24px), 100% 100%, 0 100%)'
  }
});

export const clipPathReveal = trigger('clipPathReveal', [
  transition(':enter', [ useAnimation(clipPathRevealAnim) ])
]);

// 5) textReveal (palabra por palabra: usar spans .word dentro del contenedor)
export const textRevealAnim = animation([
  query('.word', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    stagger('{{stagger}}', [
      animate('{{duration}} {{easing}}', style({ opacity: 1, transform: 'none' }))
    ])
  ], { optional: true })
], { params: { stagger: '100ms', duration: '500ms', easing: EASE } });

export const textReveal = trigger('textReveal', [
  transition(':enter', [ useAnimation(textRevealAnim) ])
]);

// 6) parallaxScroll (elementos decorativos que se mueven con scroll)
// Uso: [@parallaxScroll]="{ value: '', params: { y: offset, duration: '120ms' } }"
export const parallaxScrollAnim = animation([
  animate('{{duration}} {{easing}}', style({ transform: 'translate3d(0, {{y}}px, 0)' }))
], { params: { y: 0, duration: '120ms', easing: EASE } });

export const parallaxScroll = trigger('parallaxScroll', [
  transition('* => *', [ useAnimation(parallaxScrollAnim) ])
]);

