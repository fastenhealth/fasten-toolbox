import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ToolboxTermsComponent } from './toolbox-terms.component';

describe('ToolboxTermsComponent', () => {
  let component: ToolboxTermsComponent;
  let fixture: ComponentFixture<ToolboxTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolboxTermsComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolboxTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require a valid name and email before continuing', () => {
    component.submit();
    expect(component.submitted).toBeFalse();

    component.signupForm.setValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });
    component.submit();

    expect(component.submitted).toBeTrue();
  });

  it('marks every required field as touched after an invalid submission', () => {
    component.submit();
    fixture.detectChanges();

    expect(component.signupForm.get('firstName').touched).toBeTrue();
    expect(component.signupForm.get('lastName').touched).toBeTrue();
    expect(component.signupForm.get('email').touched).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(3);
    expect(component.submitted).toBeFalse();
  });

  it('rejects malformed email addresses and overlong names', () => {
    component.signupForm.setValue({
      firstName: 'x'.repeat(81),
      lastName: 'Smith',
      email: 'not-an-email',
    });
    component.signupForm.markAllAsTouched();

    expect(component.controlInvalid('firstName')).toBeTrue();
    expect(component.controlInvalid('email')).toBeTrue();
    expect(component.signupForm.valid).toBeFalse();
  });

  it('renders a personalized confirmation after a valid submission', () => {
    component.signupForm.setValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const confirmation = fixture.nativeElement.querySelector('.confirmation');
    expect(confirmation).toBeTruthy();
    expect(confirmation.textContent).toContain('Thanks, Jane.');
    expect(confirmation.textContent).toContain('jane@example.com');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('renders three continuous logo sets while hiding duplicate sets from assistive technology', () => {
    const sets = fixture.nativeElement.querySelectorAll('.logo-grid-set');
    const cards = fixture.nativeElement.querySelectorAll('.integration-card');

    expect(sets.length).toBe(3);
    expect(cards.length).toBe(component.logoSources.length * 3);
    expect(sets[0].hasAttribute('aria-hidden')).toBeFalse();
    expect(sets[1].getAttribute('aria-hidden')).toBe('true');
    expect(sets[2].getAttribute('aria-hidden')).toBe('true');
    expect(sets[0].querySelector('img').getAttribute('alt')).toContain('logo');
    expect(sets[1].querySelector('img').getAttribute('alt')).toBe('');
  });

  it('links the consent copy to the privacy policy in a new protected tab', () => {
    const privacyLink = fixture.nativeElement.querySelector('.privacy-copy a');

    expect(privacyLink.getAttribute('href')).toBe('https://policy.fastenhealth.com/privacy_policy.html');
    expect(privacyLink.getAttribute('target')).toBe('_blank');
    expect(privacyLink.getAttribute('rel')).toContain('noopener');
    expect(privacyLink.getAttribute('rel')).toContain('noreferrer');
  });
});
