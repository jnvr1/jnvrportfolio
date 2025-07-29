import { TestBed } from '@angular/core/testing';
import { NotFoundPage } from './not-found.page';

describe('NotFoundPage', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render message', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('no encontrada');
  });
});
