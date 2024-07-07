using ChatAPI.Dtos;
using ChatAPI.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChatAPI.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;
        private static readonly List<MessageDto> Messages = new List<MessageDto>();

        public ChatHub(ChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("UserConnected");
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
        }
        //public async Task JoinGroup(string groupName)
        //{
        //    // Get the user information from the connection context
        //    var userName = Context.User.Identity.Name;
        //    var user = new UserConnection
        //    {
        //        GroupName = groupName,
        //        UserName = userName,
        //        ConnectionId = Context.ConnectionId
        //    };

        //    // Add the user to the group and update online users
        //    await Groups.AddToGroupAsync(user.ConnectionId, groupName);
        //    _chatService.AddUserConnectionId(user.UserName, user.ConnectionId, groupName);
        //    await DisplayOnlineUsers(groupName);

        //    // Notify clients in the group that a user has joined
        //    await Clients.Group(groupName).SendAsync("UserConnected", userName);
        //}

        //public override async Task OnDisconnectedAsync(Exception exception)
        //{
        //    var user = _chatService.GetUserByConnectionId(Context.ConnectionId);
        //    if (user != null)
        //    {
        //        await Groups.RemoveFromGroupAsync(Context.ConnectionId, user.GroupName);
        //        _chatService.RemoveUserFromList(user);
        //        await DisplayOnlineUsers(user.GroupName);
        //    }
        //    await Clients.Caller.SendAsync("UserDisconnected");
        //    await base.OnDisconnectedAsync(exception);
        //    Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        //}

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var user = _chatService.GetUserByConnectionId(Context.ConnectionId);
            if (user is not null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, user.GroupName);
                _chatService.RemoveUserFromList(user);
                await DisplayOnlineUsers(user.GroupName);
                //await Clients.Group(user.GroupName).SendAsync("ExitGroup", user.UserName);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task CloseGroupChat(string groupName, string myName)
        {
            //await Clients.Group(groupName).SendAsync("ExitGroup", myName);
            var user = _chatService.GetUserByConnectionId(Context.ConnectionId);
            if (user is not null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                _chatService.RemoveUserFromList(user);
                await DisplayOnlineUsers(groupName);
            }
            
            //else
            //{
            //    UserConnection userC = new UserConnection
            //    {
            //        GroupName = groupName,
            //        UserName = myName, 
            //        ConnectionId = Context.ConnectionId
            //    };
            //    _chatService.RemoveUserFromList(userC);
            //    await DisplayOnlineUsers(groupName);
            //}
            await Clients.Caller.SendAsync("ExitGroup", myName);
        }

        public async Task AddUserConnectionId(string name, string groupName)
        {
            //Console.WriteLine($"Adding user to group: {name}, {groupName}");
            _chatService.AddUserConnectionId(name, Context.ConnectionId, groupName);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await DisplayOnlineUsers(groupName);
            //await Clients.Group(groupName).SendAsync("UserConnected"); // Ensure this does not create a loop
        }

        public async Task ReceiveMessage(string groupName, MessageDto message)
        {
            Console.WriteLine($"Receiving message for group: {groupName}, {message.Content}");
            message.TimeStamp = DateTime.Now;
            await Clients.Group(groupName).SendAsync("NewMessage", message);
        }
        public async Task CreatePrivateChat(MessageDto message)
        {
            string privateGroupName = GetPrivateGroupName(message.From, message.To);
            await Groups.AddToGroupAsync(Context.ConnectionId, privateGroupName);
            var toConnectionId = _chatService.GetConnectionIdByUser(message.To);
            await Groups.AddToGroupAsync(toConnectionId, privateGroupName);

            await Clients.Client(toConnectionId).SendAsync("OpenPrivateChat", message);
        }
        public async Task ReceivePrivateMessage(MessageDto message)
        {
            string privateGroupName = GetPrivateGroupName(message.From, message.To);
            await Clients.Group(privateGroupName).SendAsync("NewPrivateMessage", message);
        }
        public async Task RemovePrivateChat(string from, string to)
        {
            string privateGroupName = GetPrivateGroupName(from, to);
            await Clients.Group(privateGroupName).SendAsync("ClosePrivateChat");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, privateGroupName);
            var toConnectionId = _chatService.GetConnectionIdByUser(to);
            await Groups.RemoveFromGroupAsync(toConnectionId, privateGroupName);
        }

        private string GetPrivateGroupName(string from, string to)
            => string.CompareOrdinal(from, to) < 0 ? $"{from}-{to}" : $"{to}-{from}";

        public async Task DisplayOnlineUsers(string groupName)
        {
            var onlineUsers = _chatService.GetOnlineUsers(groupName);
            Console.WriteLine($"Displaying online users for group: {groupName}, {string.Join(", ", onlineUsers)}");
            await Clients.Group(groupName).SendAsync("OnlineUsers", onlineUsers);
        }

    }
}
