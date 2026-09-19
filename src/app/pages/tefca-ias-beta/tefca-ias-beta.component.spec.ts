import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { TefcaIasBetaComponent } from './tefca-ias-beta.component';

describe('TefcaIasBetaComponent', () => {
  let component: TefcaIasBetaComponent;
  let fixture: ComponentFixture<TefcaIasBetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TefcaIasBetaComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    }).compileComponents();

    fixture = TestBed.createComponent(TefcaIasBetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
