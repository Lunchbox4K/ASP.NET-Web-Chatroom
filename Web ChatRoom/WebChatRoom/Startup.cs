using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebChatRoom.Startup))]
namespace WebChatRoom
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
