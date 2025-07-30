import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactPage } from './contact.page';

describe('ContactPage', () => {
  let component: ContactPage;
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ion-card-title')?.textContent).toContain('Enlaces');
  });

  it('should contain mailto link with expected email', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mailLink = compiled.querySelector('a[href^="mailto:"]') as HTMLAnchorElement | null;
    expect(mailLink).toBeTruthy();
    expect(mailLink?.getAttribute('href')).toBe('mailto:jonathan.viramontes.ramirez@gmail.com');
  });

  it('should contain GitHub link with expected URL', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const githubLink = compiled.querySelector('a[href*="github.com"]') as HTMLAnchorElement | null;
    expect(githubLink).toBeTruthy();
    expect(githubLink?.getAttribute('href')).toBe('https://github.com/jnvr1/jnvr1');
  });

  it('should contain LinkedIn link with expected URL', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkedinLink = compiled.querySelector('a[href*="linkedin.com"]') as HTMLAnchorElement | null;
    expect(linkedinLink).toBeTruthy();
    expect(linkedinLink?.getAttribute('href')).toBe('https://linkedin.com/in/jonathan-noe-viramontes-ramirez-7b708b162');
  });
});
