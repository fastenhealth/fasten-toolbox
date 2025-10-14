import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ResearchStudyComponent } from './research-study.component';

describe('ResearchStudyComponent', () => {
  let component: ResearchStudyComponent;
  let fixture: ComponentFixture<ResearchStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResearchStudyComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
