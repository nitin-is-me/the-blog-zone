## The Blog zone
The Blog Zone is your personal or public blogging platform without any posting rules. Post whatever you want, but try to maintain the dignity of the platform as much as possible. This repository is hosted directly on vercel, so the code is transparent. You can check the server side code <a href="https://github.com/nitin-is-me/the-blog-zone-server/">here</a>. <br>
**The Project is live <a href="https://the-blog-zone.vercel.app">here</a>**

## Features
### Account creation
You don't need email or any type of identity to signup, just create a username, enter a strong password and you're done.
### Post Privacy
You are given a choice whether you want to make your post publicly visible, or make it private so it's only visible to the you.
### Wanna make changes or remove post?
You can edit the post anytime, and for privacy I haven't added the "updatedAt" visibility. Don't like the post? Delete it anytime (I added confirmation prompt later for deletion functions).
### Exact date and time of post
Unlike many social medias where post is in "<time> ago" format, you'll see exact date and time of your post. (I implemented "<time> ago" format before, but exact time is more practical).
### Scalable and rigid database
I've switched from Non - relational database (MongoDB) to Relational database (PostgreSQL), so the application is scalable, and the data relations are much better and strong.
### Show what you feel about a post
You can comment on a post to tell what you feel about the post, and can delete it whenever you want.

### Change account information anytime
You can change your display name, username (this part was really tough) and password by clicking on the top left icon on dashboard page. Spaces in password and username are not allowed from now.

### Private posts will be encrypted
Your private posts are completely safe with node crypto encryption. Both title and content will be encrypted and original data will be replaced by some random letters and numbers before saving in database, and it'll only decrypt if the author himself is trying to access the post. Editing the private post will replace those characters with different random ones (example below). If you choose to make a private post public, then it'll decrypt the post permanently and add to public posts. Downside: Now you can't share private posts with URL to anyone, because they aren't the author of the post so their will be error while decryption.
#### Practical example
If I create a private post with title: "Test", and content: "Demo content", then in my database, the data will be saved as:<br><br> ![image](https://github.com/user-attachments/assets/a769b34e-d9b8-42e7-b345-a45a2f10c2ef)

### Search flawlessly through posts
You can search through public/private posts with either "Title", "Content" or "Author"


## Version History
| Version | Date       | Summary         |
|---------|------------|-----------------|
|1.0      | **11-Nov-2024** | First push to Github. Project was stored locally for many days, because I couldn't fix problem during login detection, so I'll just store the jwt token in localstorage (I was planning to use cookies, but many browsers block cross-site cookies). Basic feature like post creation and deletion is added. I'll continue the project after college exams. |
|1.1      | **20-Dec-2024** | I had added some credentials related to database connection in server.js, so I had to delete whole commit history in case a nerd tries to hack into my database (Stupid me). Changed signup flow. |
|1.2      | **26-Dec-2024** | Added comment feature. |
|1.3      | **27-Dec-2024** | Changed website's theme from light to dark mode. |
|1.4      | **28-Dec-2024** | Changed theme's colors and made the website mobile friendly by adding screen responsiveness. |
|1.5      | **31-Dec-2024** | Changed some text labels, like: Username (must be unique). |
|1.6      | **06-Jan-2025** | Added edit feature, missing loading icons in some pages. Fixed Bug: Posts fetching before/after user information, resulting in posts being blank while information is loaded and vice versa. |
|1.7      | **09-Jan-2025** | Added my github link in dashboard page. |
|1.8      | **13-Jan-2025** | Made some changes in UI. |
|1.9      | **14-Jan-2025** | Improved error handling (the most irritating part). |
|2.0      | **17-Jan-2025** | Big Update: Migrated to PostgreSQL, ditched MongoDB. Scaling is efficient now. I could migrate the existing posts and accounts, but i preferred to start clean and new. |
|2.1      | **04-Mar-2025** | Added confirmation on post and comment deletion. |
|2.2      | **10-Mar-2025** | Switched from <time>ago format to exact <date>,<time> format. It's better when you want to know the exact date and time of writing that post. |
|2.3      | **29-Mar-2025** | Added eye icon on password. How could I forget this lol, my friend pointed that out. |
|2.4      | **27-Apr-2025** | Added profile page with features to update name, username (toughest part) and password. The icon will be at top left. From now on, no spaces in username and password are allowed |
|2.5      | **28-Apr-2025** | Added "Member since" in profile page. |
|2.6      | **29-Apr-2025** | Big Update: Added content encryption for title and content in private posts. Original content will be replaced by random letters and numbers before saving to database, and will be decrypted only if the author tries to access. Now you can't share a private post with URL, it's securely only yours. Also added privacy encryption notice in blog create/edit page. |
|2.7      | **30-Apr-2025** | Added search through title, content or author feature for private/public posts. Logout button is moved to profile page now. |
|2.8      | **01-May-2025** | Removed "Made with love by Nitin", and added source code links in the website root. Also added confirmation on logout. |
|2.9      | **03-May-2025** | Fixed Bug: User information loading after loading icon, leading to "Delete" showing late on own comment. |
|3.0      | **16-Nov-2025** | Added Link component for blog title in dashboard. |
|3.1      | **19-Nov-2025** | Added password recovery instructions in the login page (it looks a bit cluttered but it was necessary). |
|3.2      | **23-Dec-2025** | Edited description and added google-site-verification code (hoping my site appears under google results lol). |
|3.3      | **27-Dec-2025** | BIG UPDATE: changed UI by implementing shadcn/ui components to refine the site. I have kept the old ui in the 'old-ui' branch of this repository. You can check changed.md file for the changes made. |
|3.4      | **27-Dec-2025** | Added profile section for users to see their (and other users) posts and comments. |

--------------
### Contribute to the project
The Blog Zone is an open source project, hence it welcomes all improvements from anyone interested. New features will be coming soon, thanks!
