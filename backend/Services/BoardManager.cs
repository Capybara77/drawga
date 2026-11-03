using System.ComponentModel;
using Newtonsoft.Json;

namespace Drawga.Services
{
    public class BoardManager
    {
        private string PathToSaves { get; } = "saves";
        private IDictionary<string, List<byte[]>> Boards { get; }

        public BoardManager(IDictionary<string, List<byte[]>> boards)
        {
            Boards = boards;

            if (!Directory.Exists(PathToSaves))
            {
                Directory.CreateDirectory(PathToSaves);
            }
        }


        public void SaveBoard(string id, string fileName)
        {
            if (!Boards.ContainsKey(id))
            {
                throw new ArgumentException(nameof(id));
            }

            var pathToFile = $"{PathToSaves}/{fileName}";

            if (File.Exists(pathToFile))
                File.Delete(pathToFile);

            File.WriteAllText(pathToFile, JsonConvert.SerializeObject(Boards[id]));
        }

        public void LoadBoard(string id, string fileName)
        {
            var pathToFile = $"{PathToSaves}/{fileName}";

            if (!Boards.ContainsKey(id))
                Boards.Add(id, new());

            if (!File.Exists(pathToFile))
                return;

            Boards[id] = JsonConvert.DeserializeObject<List<byte[]>>(File.ReadAllText(pathToFile)) ?? new();
        }
    }
}
