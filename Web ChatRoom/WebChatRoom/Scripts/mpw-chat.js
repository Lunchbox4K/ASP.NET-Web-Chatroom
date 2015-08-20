$(document).ready(function (mpwchat) {

    mpwchat.log = mpwchat.log || {};    //Log
    //Log write helper function (txaChat ID hard coded in)
    mpwchat.log.write = function (message) {
        //Create the log message
        if (typeof (message) != typeof ("")) message = "[kb] Invalid Log Message Format!";
        //Append the new log message
        var msg = document.getElementById("txaChat").value;
        msg += message + '\n';
        document.getElementById("txaChat").value = msg;
    }

    var conn = $.hubConnection();   //Hub (server) connection private var 
    var gHub = conn.createHubProxy('chatHub'); //Chat Hub (server) Proxy var
    var joinedChat = false; //Joined chat server flag


    //Bind Connect Button
    $('#btnJoin').click(function () {

        //On Connect
        if (!joinedChat) {
            document.getElementById("txaChat").value = ""; //Reset chat box
            mpwchat.log.write("[MPW Chat] Connecting...");
            conn.stop();
            //Start connection
            conn.start().done(function () {
                try {
                    mpwchat.log.write("[MPW Chat] Connected to Chat Server");
                    //Connect Request
                    var userName = document.getElementById("txbUserName").value;
                    if (!userName) {
                        mpwchat.log.write("[MPW Chat]{Error} Invalid Username");
                    } else {
                        mpwchat.log.write("[MPW Chat] Joining as " + userName);
                        gHub.invoke('userInformation', userName)
                            .done(function () {
                                //Request Sent
                            })
                            .fail(function (error) {
                                //Request Failed
                                mpwchat.log.write("[MPW Chat]{Error} " + error.message);
                                conn.stop();
                                joinedChat = false;
                            });
                    }
                } catch (ex) {
                    mpwchat.log.write("[MPW Chat]{Error} " + ex.message);
                    conn.stop();
                    joinedChat = false;
                }
            });

            //On Disconnect
        } else {
            conn.stop();
        }
    });


    //Connect Button
    $('#btnSend').click(function () {
        if (joinedChat) {
            //if (document.getElementById("txbMessage").value.length > 0) {
            gHub.invoke('messageFromUser', document.getElementById("txbMessage").value)
                .done(function () {
                    //Request Sent
                    document.getElementById("txbMessage").value = "";
                })
                .fail(function (error) {
                    //Request Failed
                    mpwchat.log.write("[MPW Chat]{Error} " + error.message);
                    conn.stop();
                    joinedChat = false;
                });
            //}
        }
    });

    //Server message: In response to userInformation
    gHub.on('userInfoResults', function (results) {
        if (results) {
            mpwchat.log.write("[MPW Chat] Joined Chat");
            document.getElementById("btnJoin").value = "Disconnect";
        }
        else {
            conn.stop();
        }
        joinedChat = results;
    });

    //Hub event: Disconnected
    conn.disconnected(function () {
        mpwchat.log.write("Disconnected");
        document.getElementById("txaUsers").value = "";
        document.getElementById("btnJoin").value = "Join";
        joinedChat = false;
    });

    //Server message: New user
    gHub.on('newUser', function (user) {
        document.getElementById("txaChat").value += "User '" + user + "' Joined the chat\n";
    });

    //Server message: Connected user list
    gHub.on('userList', function (users, userCount) {
        try {
            var userList = document.getElementById("txaUsers");
            var list = "";
            for (var i = 0; i < userCount; i++) {
                list += users[i];
                list += '\n';
            }
            userList.value = list;
        } catch (ex) {
            mpwchat.log.write("[MPW Chat]{Error} " + ex.message);
        }
    });

    //Server message: User left
    gHub.on('userLeft', function (user) {
        try {
            document.getElementById("txaChat").value += "User '" + user + "' Disconnected \n";
        } catch (ex) {
            mpwchat.log.write("[MPW Chat]{Error} " + ex.message);
        }
    });

    //Server message: User message
    gHub.on('messageToUsers', function (username, message) {
        try {
            document.getElementById("txaChat").value += username + ": " + message + '\n';

        } catch (ex) {
            mpwchat.log.write("[MPW Chat]{Error} " + ex.message);
        }
    });

}(window.mpwchat = window.mpwchat || {}));
