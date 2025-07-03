import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private roomIdSubject = new BehaviorSubject<string>('');
  private currentUserSubject = new BehaviorSubject<string>('');
  private connectedSubject = new BehaviorSubject<boolean>(false);

  roomId$ = this.roomIdSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();

  setRoomId(roomId: string) {
    this.roomIdSubject.next(roomId);
  }

  setCurrentUser(user: string) {
    this.currentUserSubject.next(user);
  }

  setConnected(status: boolean) {
    this.connectedSubject.next(status);
  }
}