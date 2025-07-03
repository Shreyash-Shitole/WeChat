import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../services/room.service';
import { ChatStateService } from '../../services/chat-state.service';

@Component({
  selector: 'app-join-create-chat',
  templateUrl: './join-create-chat.component.html',
  styleUrls: ['./join-create-chat.component.scss']
})
export class JoinCreateChatComponent implements OnInit {
  chatForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private chatState: ChatStateService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.chatForm = this.fb.group({
      userName: ['', Validators.required],
      roomId: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  async joinChat() {
    if (this.chatForm.invalid) {
      this.toastr.error('Please fill all fields!');
      return;
    }

    this.isSubmitting = true;
    const { userName, roomId } = this.chatForm.value;

    try {
      const room = await this.roomService.joinChat(roomId).toPromise();
      this.toastr.success(`Welcome to room ${room.roomId}!`, '', {
        positionClass: 'toast-top-center',
        toastClass: 'bg-blue-600 text-white'
      });
      
      this.chatState.setCurrentUser(userName);
      this.chatState.setRoomId(room.roomId);
      this.chatState.setConnected(true);
      this.router.navigate(['/chat']);
    } catch (error) {
      this.toastr.error(error.error || 'Error joining room', '', {
        positionClass: 'toast-top-center',
        toastClass: 'bg-red-600 text-white'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  async createChat() {
    if (this.chatForm.invalid) {
      this.toastr.error('Please fill all fields!');
      return;
    }

    this.isSubmitting = true;
    const { userName, roomId } = this.chatForm.value;

    try {
      const response = await this.roomService.createRoom(roomId).toPromise();
      this.toastr.success(`Room ${response.roomId} created!`, '', {
        positionClass: 'toast-top-center',
        toastClass: 'bg-blue-600 text-white'
      });
      
      this.chatState.setRoomId(response.roomId);
      this.chatState.setCurrentUser(userName);
      this.chatState.setConnected(true);
      this.router.navigate(['/chat']);
    } catch (error) {
      this.toastr.error(error.error || 'Error creating room', '', {
        positionClass: 'toast-top-center',
        toastClass: 'bg-red-600 text-white'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}