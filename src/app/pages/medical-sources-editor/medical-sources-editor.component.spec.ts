import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { MedicalSourcesEditorComponent } from './medical-sources-editor.component';

describe('MedicalSourcesEditorComponent', () => {
  let component: MedicalSourcesEditorComponent;
  let fixture: ComponentFixture<MedicalSourcesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesEditorComponent ],
      imports: [ FormsModule, HttpClientTestingModule ],
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
