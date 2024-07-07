using System.ComponentModel.DataAnnotations;

namespace ChatAPI.Dtos
{
    public class UserDto
    {
        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Name must be at least {3} characters and maximum {15} characters.")]
        public string Name { get; set; }
        [Required]
        public string GroupName { get; set; }
    }
}
