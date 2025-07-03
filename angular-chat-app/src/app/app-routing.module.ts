import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinCreateChatComponent } from './components/join-create-chat/join-create-chat.component';
import { ChatPageComponent } from './components/chat-page/chat-page.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: JoinCreateChatComponent },
  { path: 'chat', component: ChatPageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }