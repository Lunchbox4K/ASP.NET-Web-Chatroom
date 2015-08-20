using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace WebChatRoom.Hubs
{
    /// <summary>
    /// SignalR Hub Class for the Chat Room
    /// </summary>
    public class ChatHub : Hub
    {
        /// <summary>
        /// Connected User Dictionary
        /// </summary>
        private static readonly Dictionary<string, string> users = new Dictionary<string, string>();

        /// <summary>
        /// When user disconnects for any reason.
        /// </summary>
        /// <param name="stopCalled"></param>
        /// <returns></returns>
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            string username;
            //Try and get username
            if (users.TryGetValue(Context.ConnectionId, out username))
            {
                //Tell others the user left
                Clients.All.UserLeft(username);
                //Remove user from the server list
                users.Remove(Context.ConnectionId);

                //ecompiled list, because I was lazy with the client javascript
                List<string> userList = new List<string>();
                foreach (KeyValuePair<string, string> user in users)
                    userList.Add(user.Value);

                //Send new list to all 
                Clients.All.UserList(userList, users.Count);

            }
            return base.OnDisconnected(stopCalled);
        }

        /// <summary>
        /// Handles new user information requesting to join.
        /// </summary>
        /// <param name="username"></param>
        public void UserInformation(string username)
        {
            //Check for username
            bool results = (!users.ContainsValue(username));

            //Send results back to new user
            Clients.Caller.UserInfoResults(results);

            if (results)
            {
                //Add new user to list
                users.Add(Context.ConnectionId, username);

                //ecompiled list, because I was lazy with the client javascript
                List<string> userList = new List<string>();
                foreach (KeyValuePair<string, string> user in users)
                    userList.Add(user.Value);

                //Send new list to all 
                Clients.All.UserList(userList, users.Count);
                //Brodcast the new user to all everyone
                Clients.All.NewUser(username);
            }
        }

        /// <summary>
        /// Handles messsages from connected users.
        /// </summary>
        /// <param name="message"></param>
        public void MessageFromUser(string message)
        {
            string username;
            if (!users.TryGetValue(Context.ConnectionId, out username))
                username = "Unknown";
            Clients.All.MessageToUsers(username, message);
        }
    }
}
