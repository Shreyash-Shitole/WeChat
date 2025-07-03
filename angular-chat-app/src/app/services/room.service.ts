import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private baseURL = 'http://localhost:8080/api/v1/rooms';

  constructor(private http: HttpClient) {}

  createRoom(roomId: string): Observable<any> {
    return this.http.post(this.baseURL, roomId, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  joinChat(roomId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/${roomId}`);
  }

  getMessages(roomId: string, size = 50, page = 0): Observable<any> {
    return this.http.get(
      `${this.baseURL}/${roomId}/messages?size=${size}&page=${page}`
    );
  }
}