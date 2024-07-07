using System.Collections.Generic;
using System.Linq;

namespace ChatAPI.Services
{
    public class ChatService
    {
        private static readonly Dictionary<string, UserConnection> Users = new Dictionary<string, UserConnection>();
        //private readonly ConcurrentDictionary<string, UserConnection> _userConnections = new ConcurrentDictionary<string, UserConnection>();
        public bool AddUserToList(string userToAdd, string groupName)
        {
            lock(Users)
            {
                foreach(var user in Users)
                {
                    if(user.Key.ToLower() == userToAdd.ToLower())
                        return false;
                }
                var userConnection = new UserConnection
                {
                    UserName = userToAdd,
                    GroupName = groupName
                };
                Users.TryAdd(userToAdd, userConnection);
                return true;
            }
        }
        //public void AddUserConnectionId(string userName, string groupName)
        //{
        //    lock (Users)
        //    {
        //        if (Users.ContainsKey(userName))
        //        {
        //            var userConnection = new UserConnection
        //            {
        //                UserName = userName,
        //                GroupName = groupName
        //            };
        //            Users[userName] = userConnection;
        //        }
        //    }
        //}
        public void AddUserConnectionId(string user, string connectionId, string groupName)
        {
            lock (Users)
            {
                if (Users.ContainsKey(user))
                {
                    var userConnection = new UserConnection
                    {
                        UserName = user,
                        ConnectionId = connectionId,
                        GroupName = groupName
                    };
                    Users[user] = userConnection;
                }
            }
        }
        public UserConnection GetUserByConnectionId(string connectionId)
        {
            return Users.Where(x => x.Value.ConnectionId == connectionId).Select(x => x.Value).FirstOrDefault();
        }
        //public UserConnection GetUserByConnectionId(string connectionId)
        //{
        //    Users.TryGetValue(connectionId, out var userConnection);
        //    return userConnection;
        //}
        public string GetConnectionIdByUser(string user)
        {
            return Users.Values.FirstOrDefault(uc => uc.UserName == user)?.ConnectionId;
        }
        public void RemoveUserFromList(UserConnection user)
        {
            lock(Users)
            {
                if (user is  not null)
                {
                    if (Users.ContainsKey(user.UserName))
                        Users.Remove(user.UserName);
                }
            }
        }
        public string[] GetOnlineUsers(string groupName)
        {
            lock (Users)
            {
                return Users.Values
               .Where(uc => uc.GroupName == groupName)
               .Select(uc => uc.UserName)
               .ToArray();
            }
        }
    }
}
