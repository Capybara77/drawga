using Drawga.Controllers;
using Drawga.Draw;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Drawga.Tests;

public class BoardIdsTests
{
    [Theory]
    [InlineData("0")]
    [InlineData("48")]
    [InlineData("k3v9xq2mz7ab")]
    public void IsValid_AcceptsOldNumericAndNewIds(string id)
    {
        Assert.True(BoardIds.IsValid(id));
    }

    // id становится именем файла в saves/, поэтому всё лишнее отсекаем
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("../secret")]
    [InlineData("a/b")]
    [InlineData("a\\b")]
    [InlineData("a.board")]
    [InlineData("abc\n")]
    [InlineData("ABC")]
    [InlineData("доска")]
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")] // 33 символа
    public void IsValid_RejectsEverythingElse(string? id)
    {
        Assert.False(BoardIds.IsValid(id));
    }

    [Fact]
    public void New_IsValidAndLongEnoughNotToGuess()
    {
        var id = BoardIds.New();

        Assert.True(BoardIds.IsValid(id));
        Assert.Equal(12, id.Length);
    }

    [Fact]
    public void New_DoesNotRepeat()
    {
        var ids = Enumerable.Range(0, 1000).Select(_ => BoardIds.New()).ToHashSet();

        Assert.Equal(1000, ids.Count);
    }

    [Fact]
    public void NewBoard_RedirectsToFreshBoard()
    {
        using var controller = new DrawController();

        var first = Assert.IsType<RedirectResult>(controller.NewBoard());
        var second = Assert.IsType<RedirectResult>(controller.NewBoard());

        Assert.StartsWith("/draw?id=", first.Url);
        Assert.True(BoardIds.IsValid(first.Url["/draw?id=".Length..]));
        Assert.False(first.Permanent);
        Assert.NotEqual(first.Url, second.Url);
    }
}
