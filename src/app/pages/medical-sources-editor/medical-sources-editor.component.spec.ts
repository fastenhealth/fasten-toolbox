import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesEditorComponent } from './medical-sources-editor.component';

describe('MedicalSourcesEditorComponent', () => {
  let component: MedicalSourcesEditorComponent;
  let fixture: ComponentFixture<MedicalSourcesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
