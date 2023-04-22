using Microsoft.EntityFrameworkCore;
using websocket_chat.Models;

namespace websocket_chat.Data
{
    public class DataContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite(@"Data Source=data.db;");
        }
    }
}
