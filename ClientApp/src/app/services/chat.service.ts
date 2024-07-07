import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName: string = '';
  groupName: string = '';
  private chatConnection?: HubConnection;
  onlineUsers: string[] = [];
  messages: Message[] = [];
  privateMessages: Message[] = [];
  privateMessageInitialated = false;
  

  constructor(private httpClient: HttpClient, private modalService: NgbModal) { }

  registerUser(user: User){ 
    return this.httpClient.post(`${environment.apiUrl}api/chat/register-user`, user, {responseType: 'text', withCredentials: true});
  }

  // createChatConnection(){
  //   this.chatConnection = new HubConnectionBuilder()
  //     .withUrl(`${environment.apiUrl}hubs/chat`,{withCredentials: true}).withAutomaticReconnect().build();

  //     this.chatConnection.start().catch(error =>  {
  //       console.log(error);
  //     });

  //     this.chatConnection.on('RequestGroupName', () => {
  //       if (this.onRequestGroupName) {
  //         this.onRequestGroupName();
  //       }
  //     });

  //     this.chatConnection.on('UserConnected', () => {
  //       this.addUserConnectionId();
  //     });
  

  //     this.chatConnection.on('OnlineUsers', (onlineUsers) => {
  //       this.onlineUsers = [...onlineUsers];
  //     });

  //     this.chatConnection.on('NewMessage', (newMessage: Message) => {
  //       this.messages = [...this.messages, newMessage];
  //       this.sortMessagesByTimestamp();
  //     });

  //     this.chatConnection.on('OpenPrivateChat', (newMessage: Message) => {
  //       this.privateMessages = [...this.privateMessages, newMessage];
  //       this.privateMessageInitialated = true;
  //       const modalRef = this.modalService.open(PrivateChatComponent);
  //       modalRef.componentInstance.toUser = newMessage.from;
  //     });

  //     this.chatConnection.on('NewPrivateMessage', (newMessage: Message) => {
  //       this.privateMessages = [...this.privateMessages, newMessage];
  //       this.sortPrivateMessagesByTimestamp();
  //     });

  //     this.chatConnection.on('ClosePrivateChat', () => {
  //       this.privateMessageInitialated = false;
  //       this.privateMessages = [];
  //       this.modalService.dismissAll();
  //     });

  // }
  
    createChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}hubs/chat`, { withCredentials: true })
        .withAutomaticReconnect()
        .build();

    this.chatConnection.start().catch(error => {
        //console.log('Connection error:', error);
    });

    // this.chatConnection.on('RequestGroupName', () => {
    //     console.log('RequestGroupName received');
    //     if (this.onRequestGroupName) {
    //         this.onRequestGroupName();
    //     }
    // });

    // this.chatConnection.on('UserConnected', () => {
    //     //console.log('UserConnected event received');
    //     this.addUserConnectionId();
    //     //this.joinGroup(this.myName, this.groupName);
    // });

     this.chatConnection.on('UserConnected', () => {
        this.addUserConnectionId();
      });

  //   this.chatConnection.on('JoinGroup', () => {
  //     //console.log('UserConnected event received');
  //     this.addUserConnectionId();
  //     //this.joinGroup(this.myName, this.groupName);
  // });
    
    //this.chatConnection.off('UserConnected');

  //   this.chatConnection.on('UserDisconnected', (userName: string) => {
  //     console.log('UserDisconnected event received', userName);
  //     this.handleUserDisconnected(userName);
  // });

  // this.chatConnection.on('ExitGroup', (myName: string) => {
  //   //console.log('Exit Group event received');
  //   this.messages = [],
  //   this.modalService.dismissAll();
  //   this.removeUserFromOnlineList(myName); // Implement this method in your chat service
  // });

    this.chatConnection.on('OnlineUsers', (onlineUsers) => {
        //console.log('OnlineUsers event received:', onlineUsers);
        this.onlineUsers = [...onlineUsers];
    });

    this.chatConnection.on('NewMessage', (newMessage: Message) => {
        //console.log('NewMessage event received:', newMessage);
        this.messages = [...this.messages, newMessage];
        this.sortMessagesByTimestamp();
    });
    
    this.chatConnection.on('OpenPrivateChat', (newMessage: Message) => {
        //console.log('OpenPrivateChat event received:', newMessage);
        this.privateMessages = [...this.privateMessages, newMessage];
        this.privateMessageInitialated = true;
        const modalRef = this.modalService.open(PrivateChatComponent);
        modalRef.componentInstance.toUser = newMessage.from;
    });

    this.chatConnection.on('NewPrivateMessage', (newMessage: Message) => {
        //console.log('NewPrivateMessage event received:', newMessage);
        this.privateMessages = [...this.privateMessages, newMessage];
        this.sortPrivateMessagesByTimestamp();
    });

    this.chatConnection.on('ClosePrivateChat', () => {
        //console.log('ClosePrivateChat event received');
        this.privateMessageInitialated = false;
        this.privateMessages = [];
        this.modalService.dismissAll();
    });
}


  stopChatConnection(){
    //console.log('stop chat connection');
    this.clearMessages();
    //this.closeGroupChat();
    this.removeUserFromOnlineList(this.myName);
    this.chatConnection?.stop().catch(error => console.log(error));
  }
  //////////
  clearMessages() {
    this.messages = [];
  }
  //////////
  async addUserConnectionId(){
    
    //console.log('new user have joined to the chat.');

    this.chatConnection?.invoke('AddUserConnectionId', this.myName, this.groupName)
    .catch(error => console.log(error));

    return this.sendMessage(this.myName.toUpperCase() +' have joined to the group.', 'System');
  }

  // joinGroup(userName: string, groupName: string): void {
  //   this.myName = userName;
  //   this.groupName = groupName;
  //   this.messages = [];
  //   console.log('Joining group:', userName, groupName);
  //   this.chatConnection?.invoke('AddUserConnectionId', userName, groupName)
  //     .catch(err => console.error('Join group error:', err.toString()));
  // }

  // async joinGroup(groupName: string): Promise<void> {
  //   // Assuming you have a way to get the user's name
  //   const userName = this.myName; // Replace with actual user name logic

  //   // Call the server-side method to join the group
  //   await this.chatConnection?.invoke('JoinGroup', groupName);

  //   // Add user connection info (assuming this method handles the logic on the server)
  //   // await this.addUserConnectionId(userName, groupName);
  // }

   async sendMessage(content: string, from: string): Promise<void> {
    const message: Message = {
      from: from,
      content,
      timeStamp: new Date()
    };
    //console.log('Sending message:', message);
    return this.chatConnection?.invoke('ReceiveMessage', this.groupName, message)
      .catch(error => console.log('Send message error:', error));
  }

  async sendPrivateMessage(to: string, content: string){
    const message: Message = {
      from: this.myName,
      to,
      content,
      timeStamp: new Date()
    };

    if(!this.privateMessageInitialated){
      this.privateMessageInitialated = true;
      return this.chatConnection?.invoke('CreatePrivateChat', message).then(() => {
        this.privateMessages = [...this.privateMessages, message];
      })
      .catch(error => console.log(error));
    }
    else{
      return this.chatConnection?.invoke('ReceivePrivateMessage', message)
      .catch(error => console.log(error));
    }
  }
  

  // async closeGroupChat(){
  //   console.log('close group chat');
  //   return this.chatConnection?.invoke('CloseGroupChat', this.groupName, this.myName)
  //   .catch(error => console.log(error));
  //   //this.stopChatConnection();
  // }

  async closePrivateChatMessage(otherUser: string){
    return this.chatConnection?.invoke('RemovePrivateChat', this.myName, otherUser)
    .catch(error => console.log(error));
  }

  getMessages(){
    return this.messages;
  }

  // closeConnectionAndRemoveFromGroup(groupName: string): Promise<void> {
  //   if (!this.chatConnection) {
  //     return Promise.reject(new Error('Chat connection is not established.'));
  //   }

  //   return this.chatConnection.invoke('CloseGroupChat', groupName, this.myName)
  //     .catch(error => {
  //       console.error('Error closing connection:', error);
  //       throw error; // Optional: rethrow the error for handling in the calling component
  //     });
  // }

  // public onRequestGroupName = (): void => {
  //   // Implement the logic to get the group name, e.g., prompt the user or fetch it from a stored variable
  //   const groupName = prompt('Please enter your group name:');
  //   if (groupName) {
  //     this.groupName = groupName;
  //     // Join the group after getting the group name
  //     this.joinGroup(this.myName, this.groupName);
  //   }
  // }


  removeUserFromOnlineList(userName: string): void {
    //console.log('removeUserFromOnlineList');
    const index = this.onlineUsers.indexOf(userName);
    if (index !== -1) {
        this.onlineUsers.splice(index, 1); // Remove the user from the list
    }
  }

  private sortMessagesByTimestamp() {
    return this.messages.sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
  }
  private sortPrivateMessagesByTimestamp() {
    return this.privateMessages.sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
  }
}
