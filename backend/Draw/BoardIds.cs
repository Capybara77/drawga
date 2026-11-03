using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography;

namespace Drawga.Draw;

public static class BoardIds
{
    private const string Alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    private const int NewIdLength = 12;
    private const int MaxLength = 32;

    public static string New() => RandomNumberGenerator.GetString(Alphabet, NewIdLength);

    // id становится именем файла в saves/. Только нижний регистр: иначе A и a на macOS — один файл.
    // Старые числовые доски проходят тоже
    public static bool IsValid([NotNullWhen(true)] string? id) =>
        id is { Length: > 0 and <= MaxLength } && id.All(c => Alphabet.Contains(c));
}
