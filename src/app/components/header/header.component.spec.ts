import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HeaderComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have navigation buttons', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('ion-button').length).toBeGreaterThan(0);
  });

  it('should apply active class to current route button', fakeAsync(() => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    router.navigateByUrl('/about');
    tick();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('ion-button');
    const aboutButton = buttons[1];
    expect(aboutButton.classList.contains('active')).toBeTrue();
  }));
});
