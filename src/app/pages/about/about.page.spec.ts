import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prepare animated words on init', () => {
    component.ngOnInit();
    expect(component.wordsEls.length).toBe(component.fullText.split(' ').length);
  });

  it('should clear timeouts on destroy', () => {
    component.ngOnInit();
    expect((component as any).timeouts.length).toBeGreaterThan(0);
    component.ngOnDestroy();
    expect((component as any).timeouts.length).toBe(0);
  });
});
