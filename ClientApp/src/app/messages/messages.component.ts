import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from '../models/message';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewChecked  {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Input() messages: Message[] = [];
  


  constructor(public chatService: ChatService) { }
  
  ngOnInit(): void {
    this.chatService.getMessages().sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());  
  }

  ngAfterViewChecked(): void {
    this.scrollToTop();
  }

scrollToTop(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = 0;
    } catch (err) {
      console.error('Error scrolling to top', err);
    }
  }

  
  
}
