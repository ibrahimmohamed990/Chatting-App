using System;
using System.ComponentModel.DataAnnotations;

namespace ChatAPI.Dtos
{
    public class MessageDto
    {
        [Required]
        public string From { get; set; }
        public string To { get; set; }
        [Required]
        public string Content { get; set; }
        public DateTime TimeStamp { get; set; } = DateTime.Now;

    }
}
