import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit , OnDestroy{
  @Output() closeChatEmitter = new EventEmitter();  
  userName: string = '';
  groupName = '';
  message = '';
  messages: { user: string, message: string }[] = [];
  onlineUsers: string[] = [];

  constructor(public chatService: ChatService, private modalService: NgbModal) { 
    //this.chatService.onRequestGroupName = this.requestGroupName.bind(this);
  }
  
  ngOnInit(): void {
    this.chatService.createChatConnection();
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    // this.chatService.clearMessages();
    // this.chatService.stopChatConnection();
    // this.chatService.closeConnectionAndRemoveFromGroup(this.groupName);
    this.chatService.stopChatConnection();
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    //this.chatService.closeGroupChat();

  }
  
  private handleBeforeUnload(event: BeforeUnloadEvent) {
    this.chatService.sendMessage(this.chatService.myName.toUpperCase() +' left the group.', 'System');
    //this.chatService.stopChatConnection();
  }
  
  backToHome(){
    this.chatService.sendMessage(this.chatService.myName.toUpperCase() +' left the group.', 'System');
    this.closeChatEmitter.emit();
    //this.chatService.closeGroupChat();
  }

  sendMessage(content: string){
    this.chatService.sendMessage(content, this.chatService.myName);
  }

  // joinGroup() {
  //   if (this.groupName && this.userName) {
  //     this.chatService.joinGroup(this.groupName).then(() => {
  //       console.log(`Joined group: ${this.groupName}`);
  //     }).catch(error => {
  //       console.error('Error joining group:', error);
  //     });
  //   } else {
  //     console.error('Group name and user name are required.');
  //   }
  // }

  // joinGroup() {
  //   this.chatService.joinGroup(this.userName, this.groupName);
  // }
  
  openPrivateChat(toUser: string){
    const modalRef = this.modalService.open(PrivateChatComponent);
    modalRef.componentInstance.toUser = toUser;
  }


  // requestGroupName() {
  //   const groupName = prompt('Please enter your group name:');
  //   if (groupName) {
  //     this.groupName = groupName;
  //     this.joinGroup();
  //   }
  // }

  // closeConnection(groupName: string) {
  //   this.chatService.closeConnectionAndRemoveFromGroup(groupName).then(() => {
  //     console.log('Connection closed successfully');
  //     // Optionally, handle success (e.g., show a success message or update UI)
  //   }).catch(error => {
  //     console.error('Error closing connection:', error);
  //     // Optionally, handle error (e.g., show an error message or alert)
  //   });
  // }


}

