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
});
