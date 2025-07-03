import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStateService } from '../../services/chat-state.service';
import { RoomService } from '../../services/room.service';
import { ToastrService } from 'ngx-toastr';
import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  @ViewChild('chatBox') chatBox: ElementRef;
  @ViewChild('messageInput') messageInput: ElementRef;

  messages: any[] = [];
  input = '';
  stompClient: any;
  showUserDropdown = false;
  bgStyle: any;
  floatingElements: any[] = [];
  
  private subscriptions = new Subscription();
  roomId: string;
  currentUser: string;
  connected: boolean;

  constructor(
    private chatState: ChatStateService,
    private roomService: RoomService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.chatState.roomId$.subscribe(roomId => this.roomId = roomId)
    );
    this.subscriptions.add(
      this.chatState.currentUser$.subscribe(user => this.currentUser = user)
    );
    this.subscriptions.add(
      this.chatState.connected$.subscribe(connected => {
        this.connected = connected;
        if (!connected) {
          this.router.navigate(['/']);
        }
      })
    );

    this.initializeBackground();
    this.loadMessages();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.subscriptions.unsubscribe();
  }

  initializeBackground() {
    this.bgStyle = this.generateBackground();
    this.floatingElements = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      opacity: Math.random() * 0.1 + 0.05,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
  }

  generateBackground() {
    const hue = Math.floor(Math.random() * 360);
    const options = [
      `linear-gradient(135deg, hsl(${hue}, 80%, 96%) 0%, hsl(${hue}, 60%, 92%) 100%)`,
      `linear-gradient(to bottom right, hsl(${hue}, 70%, 95%), hsl(${hue + 30}, 60%, 90%)`,
      `radial-gradient(circle at center, hsl(${hue}, 70%, 96%), hsl(${hue + 60}, 60%, 92%))`
    ];
    return {
      background: options[Math.floor(Math.random() * options.length)],
      type: "gradient"
    };
  }

  getColorFromName(name: string): string {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
      'bg-amber-500', 'bg-rose-500', 'bg-emerald-500',
      'bg-indigo-500', 'bg-fuchsia-500'
    ];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  }

  async loadMessages() {
    if (this.connected && this.roomId) {
      try {
        const fetchedMessages = await this.roomService.getMessages(this.roomId).toPromise();
        this.messages = fetchedMessages;
        this.scrollToBottom();
      } catch (error) {
        this.toastr.error('Failed to load messages.');
        console.error('Error loading messages:', error);
      }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBox?.nativeElement) {
        this.chatBox.nativeElement.scroll({
          top: this.chatBox.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 0);
  }

  connectWebSocket() {
    if (!this.connected || !this.roomId) return;

    const sock = new SockJS('http://localhost:8080/chat');
    this.stompClient = Stomp.Stomp.over(sock);

    this.stompClient.connect({}, () => {
      this.toastr.success('Connected to chat', '', {
        positionClass: 'toast-top-center',
        toastClass: 'bg-indigo-600 text-white'
      });

      this.stompClient.subscribe(`/topic/room/${this.roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        this.messages = [...this.messages, newMessage];
        this.scrollToBottom();
      }, (error) => {
        this.toastr.error('Subscription error: ' + error.message);
        console.error('STOMP subscription error:', error);
      });
    }, (error) => {
      this.toastr.error('WebSocket connection failed: ' + error.message);
      console.error('STOMP connection error:', error);
      this.chatState.setConnected(false);
    });
  }

  sendMessage() {
    if (this.stompClient && this.connected && this.input.trim()) {
      try {
        this.stompClient.send(
          `/app/sendMessage/${this.roomId}`,
          {},
          JSON.stringify({
            sender: this.currentUser,
            content: this.input,
            roomId: this.roomId,
            timeStamp: Date.now(),
          })
        );
        this.input = '';
      } catch (error) {
        this.toastr.error('Failed to send message.');
        console.error('Error sending message:', error);
      }
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  handleLogout() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        this.toastr.success('Disconnected from chat.');
      });
    }
    this.chatState.setConnected(false);
    this.chatState.setRoomId('');
    this.chatState.setCurrentUser('');
    this.router.navigate(['/']);
  }
}