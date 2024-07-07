import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userForm: FormGroup = new FormGroup({});
  submitted = false;
  apiErrorMessages: string[] = [];
  openChat = false;
  userName = '';
  groupName = '';
  message = '';
  messages: { user: string, message: string }[] = [];

  constructor(private formBuilder: FormBuilder, private chatService: ChatService) { 
    //this.chatService.onRequestGroupName = this.requestGroupName.bind(this);
  }

  ngOnInit(): void {
    this.initialzeForm();
  }

  initialzeForm(){
    this.chatService.stopChatConnection();
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      groupName: ['', Validators.required]
    })
  }

  submitForm(){
    this.submitted = true;
    this.apiErrorMessages = [];

    if(this.userForm.valid){
      this.chatService.registerUser(this.userForm.value).subscribe({
        next: () => {
          this.chatService.myName = this.userForm.get('name')?.value; 
          this.chatService.groupName = this.userForm.get('groupName')?.value; 
          this.openChat = true;
          this.userForm.reset();
          this.submitted = false;
          this.joinGroup();
        },
        error: error => {
          if(typeof(error.error) !== 'object'){
            this.apiErrorMessages.push(error.error);
          }
        }
      })

    }
  }

  joinGroup(): void {
    this.chatService.addUserConnectionId();
  }

  // requestGroupName() {
  //   const groupName = prompt('Please enter your group name:');
  //   if (groupName) {
  //     this.groupName = groupName;
  //     this.userName = 
  //     this.joinGroup();
  //   }
  // }
closeChat(){
  this.openChat = false;
 //this.chatService.closeGroupChat();
 //this.chatService.stopChatConnection();
}

}
