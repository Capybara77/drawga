namespace websocket_chat.Models
{
    public class Board
    {
        public int Id { get; set; }
        public User User { get; set; }
        public int BoardId { get; set; }
        public bool Private { get; set; }
    }
}
