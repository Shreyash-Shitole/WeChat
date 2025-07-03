import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinCreateChat } from './join-create-chat.component';

describe('JoinCreateChat', () => {
  let component: JoinCreateChat;
  let fixture: ComponentFixture<JoinCreateChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinCreateChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCreateChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
