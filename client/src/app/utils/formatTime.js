// Showing time in <time> ago format
// export function formatTimeAgo(date) {
//     const now = new Date();
//     const timeDiff = now - new Date(date);
  
//     const seconds = Math.floor(timeDiff / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
//     const weeks = Math.floor(days/ 7);
//     const months = Math.floor(days / 30);
//     const years = Math.floor(days / 365);

//     Option 1: Using full values

//     // if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
//     // if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     // if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
//     // return `${seconds} second${seconds > 1 ? 's' : ''} ago`;

//     Option 2: Using abbreviations 

//     if(years > 0) return `${years}y ago`;
//     if(months> 0) return `${months}mo ago`;
//     if(weeks> 0) return `${weeks}w ago`;
//     if(days> 0) return `${days}d ago`;
//     if(hours> 0) return `${hours}h ago`;
//     if(minutes> 0) return `${minutes}m ago`;
//     return `${seconds}s ago`
//   }

//   //I've used this before in study-together
  

// showing exact date and time
export function formatTimeAgo(date) {
  const postDate = new Date(date);

  // Extract date and time components
  const day = postDate.getDate();
  const month = postDate.getMonth() + 1; // I added one because in javascript, months are indexed from 0
  const year = postDate.getFullYear().toString().slice(-2); // Getting last two digits of the year
  const hours = postDate.getHours();
  const minutes = postDate.getMinutes();

  // Format the date and time
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`; // 24-hour format, less complex than a.m/p.m

  return `${formattedDate}, ${formattedTime}`;
}
