using Drawga.Data;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Drawga.Tests;

public class DataContextTests
{
    [Fact]
    public void UsesConnectionStringFromConfigAndCreatesSchema()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"drawga-{Guid.NewGuid()}.db");
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = $"Data Source={dbPath}",
            })
            .Build();

        try
        {
            using var context = new DataContext(config);
            context.Database.EnsureCreated();

            Assert.True(File.Exists(dbPath));
            Assert.Empty(context.Users);
            Assert.Empty(context.Boards);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            File.Delete(dbPath);
        }
    }
}
