import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split text into words on init', () => {
    component.ngOnInit();
    expect(component.words.length).toBeGreaterThan(0);
    expect(component.words).toEqual(component.fullText.split(' '));
  });

  it('should clear timeouts on destroy', () => {
    component.ngOnInit();
    component.ionViewDidEnter();
    expect((component as any).timeouts.length).toBeGreaterThan(0);
    component.ngOnDestroy();
    expect((component as any).timeouts.length).toBe(0);
  });
});
