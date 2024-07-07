export interface Message{
    from: string;
    to?: string;
    content: string;
    timeStamp: Date
}

// export class Message {
//     constructor(
//       public content: string,
//       public sender: string,
//       public timestamp: Date
//     ) {}
//   }