using Drawga.Models;
using Microsoft.EntityFrameworkCore;

namespace Drawga.Data
{
    public class DataContext : DbContext
    {
        private readonly string _connectionString;

        public DataContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("Default") ?? "Data Source=data.db;";
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite(_connectionString);
        }
    }
}
