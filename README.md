## The Blog zone
The Blog Zone is your personal or public blogging platform without any posting rules. Post whatever you want, but try to maintain the dignity of the platform as much as possible. This repository is hosted directly on vercel, so the platform is completely transparent. <br>
> **The Project is live <a href="https://the-blog-zone.vercel.app">here</a>**

> [!IMPORTANT]
> **Project Status: Feature Complete & Maintenance Mode**
> 
> The Blog Zone has officially reached its feature-complete milestone! I will now be shifting my primary focus to other projects, meaning this repository will mainly receive minor maintenance and security updates. However, the project remains open-source, and if anyone would like to contribute improvements or new features, you are most welcome!

## Features
### Account creation
You don't need email or any type of identity to signup, just create a username, enter a strong password and you're done.

### Email Authentication & Password Recovery
While not required (because I respect users who don't want to link emails to their accounts for anonymity), **it is highly recommended** to link an email address to your account from your Profile Settings. Adding an email activates our secure 6-digit OTP verification flow. This not only allows you to log in seamlessly using your email address, but more importantly, gives you access to the fully integrated "Forgot Password" flow to recover your account if you ever get locked out!
### Post Privacy
You are given a choice whether you want to make your post publicly visible, or make it private so it's only visible to the you.
### Wanna make changes or remove post?
You can edit the post anytime, and for privacy I haven't added the "updatedAt" visibility. Don't like the post? Delete it anytime (I added confirmation prompt later for deletion functions).
### Exact date and time of post
Unlike many social medias where post is in "<time> ago" format, you'll see exact date and time of your post. (I implemented "<time> ago" format before, but exact time is more practical).

### Show what you feel about a post
You can comment on a post to tell what you feel about the post, and can delete it whenever you want.

### Change account information anytime
You can change your display name, username (this part was really tough) and password by clicking on the top left icon on dashboard page. Spaces in password and username are not allowed from now.

### Private posts will be encrypted
Your private posts are completely safe. Both title and content will be securely encrypted before saving, and they'll only decrypt if the author himself is trying to access the post. Editing the private post will replace those characters with different random ones (example below). If you choose to make a private post public, then it'll decrypt the post permanently and add to public posts. Downside: Now you can't share private posts with URL to anyone, because they aren't the author of the post so their will be error while decryption.

#### Database Representation
This is how public posts appear in the database:

<img width="621" height="138" alt="image" src="https://github.com/user-attachments/assets/fed1bbf5-f1aa-4c23-8f17-6e3ef8e71be8" />

And, this is how private posts appear in the database

<img width="621" height="138" alt="image" src="https://github.com/user-attachments/assets/0d56c1ba-42e2-48a8-a519-cf99de1e00ab" />

### Search flawlessly through posts
You can search through public/private posts with either "Title", "Content" or "Author"

### Write with power (Rich Text & Images)
I ditched the plain old textareas and implemented a proper Rich Text Editor. You can now format your text, add links, and upload images directly. Images are securely hosted and managed, and I even added an auto-cleanup feature so images get completely deleted from the servers if you ever delete your post or remove the image.

### AI Writing Assistant & Summaries 
Sometimes you know what to say but don't know how to say it. I've integrated lightning-fast AI directly into the editor. Just highlight any text to instantly improve your writing, make it concise, simplify, or expand it! Also, if a post is too long, readers can click a single button to get a quick 3-bullet-point AI summary without reading the whole thing. 

> [!NOTE]
> I intentionally limited the AI to just these few specific actions instead of bombarding the application with AI features. I didn't want to make the platform overly AI-centric just for the hype. I only used it where it actually provides genuine value without taking away the human element of blogging.

### Infinitely Nested Comments
Why stop at one layer? You can now reply directly to other comments on a post, creating deeply nested, threaded conversations that scale flawlessly.

### Complete Platform Moderation
I've also built a fully isolated Admin Dashboard. I can now oversee all users on the platform, instantly ban/unban accounts to revoke their access, permanently delete accounts (with smart auto-cleanup of all their images), and remove inappropriate public posts.

## For nerds
If you are curious about what's powering this platform under the hood, here's the deep dive:
- **Frontend**: Built with Next.js (React), styled with Tailwind CSS, and using Shadcn/UI for component design. The editor uses Tiptap.
- **Backend**: Node.js and Express.js.
- **Database**: PostgreSQL (migrated from MongoDB for strong relations). The infinitely nested comments use an efficient Adjacency List model in SQL.
- **Security**: Node's built-in `crypto` library is used for AES encryption/decryption of private posts on the server.
- **Storage**: Supabase storage buckets handle all the direct client-to-server image uploads and auto-cleanup.
- **AI Integration**: Powered by Groq's `openai/gpt-oss-20b` model for instant text processing.
- **Hosting**: The entire application is hosted and deployed on Vercel.


## Version History
| Version | Date       | Summary         |
|---------|------------|-----------------|
|1.0.0    | **11-Nov-2024** | First push to Github. Project was stored locally for many days, because I couldn't fix problem during login detection, so I'll just store the jwt token in localstorage (I was planning to use cookies, but many browsers block cross-site cookies). Basic feature like post creation and deletion is added. I'll continue the project after college exams. |
|1.1.0    | **20-Dec-2024** | I had added some credentials related to database connection in server.js, so I had to delete whole commit history in case a nerd tries to hack into my database (Stupid me). Changed signup flow. |
|1.2.0    | **26-Dec-2024** | Added comment feature. |
|1.2.1    | **27-Dec-2024** | Changed website's theme from light to dark mode. |
|1.2.2    | **28-Dec-2024** | Changed theme's colors and made the website mobile friendly by adding screen responsiveness. |
|1.2.3    | **31-Dec-2024** | Changed some text labels, like: Username (must be unique). |
|1.3.0    | **06-Jan-2025** | Added edit feature, missing loading icons in some pages. Fixed Bug: Posts fetching before/after user information, resulting in posts being blank while information is loaded and vice versa. |
|1.3.1    | **09-Jan-2025** | Added my github link in dashboard page. |
|1.3.2    | **13-Jan-2025** | Made some changes in UI. |
|1.3.3    | **14-Jan-2025** | Improved error handling (the most irritating part). |
|2.0.0    | **17-Jan-2025** | Big Update: Migrated to PostgreSQL, ditched MongoDB. Scaling is efficient now. I could migrate the existing posts and accounts, but i preferred to start clean and new. |
|2.1.0    | **04-Mar-2025** | Added confirmation on post and comment deletion. |
|2.1.1    | **10-Mar-2025** | Switched from <time>ago format to exact <date>,<time> format. It's better when you want to know the exact date and time of writing that post. |
|2.1.2    | **29-Mar-2025** | Added eye icon on password. How could I forget this lol, my friend pointed that out. |
|2.2.0    | **27-Apr-2025** | Added profile page with features to update name, username (toughest part) and password. The icon will be at top left. From now on, no spaces in username and password are allowed |
|2.2.1    | **28-Apr-2025** | Added "Member since" in profile page. |
|3.0.0    | **29-Apr-2025** | Big Update: Added content encryption for title and content in private posts. Original content will be replaced by random letters and numbers before saving to database, and will be decrypted only if the author tries to access. Now you can't share a private post with URL, it's securely only yours. Also added privacy encryption notice in blog create/edit page. |
|3.1.0    | **30-Apr-2025** | Added search through title, content or author feature for private/public posts. Logout button is moved to profile page now. |
|3.1.1    | **01-May-2025** | Removed "Made with love by Nitin", and added source code links in the website root. Also added confirmation on logout. |
|3.1.2    | **03-May-2025** | Fixed Bug: User information loading after loading icon, leading to "Delete" showing late on own comment. |
|3.1.3    | **16-Nov-2025** | Added Link component for blog title in dashboard. |
|3.1.4    | **19-Nov-2025** | Added password recovery instructions in the login page (it looks a bit cluttered but it was necessary). |
|3.1.5    | **23-Dec-2025** | Edited description and added google-site-verification code (hoping my site appears under google results lol). |
|4.0.0    | **27-Dec-2025** | BIG UPDATE: changed UI by implementing shadcn/ui components to refine the site. I have kept the old ui in the 'old-ui' branch of this repository. You can check changed.md file for the changes made. |
|4.1.0    | **27-Dec-2025** | Added profile section for users to see their (and other users) posts and comments. |
|5.0.0    | **28-Jun-2026** | BIG UPDATE (My exams are almost over so I have some free time to improve this project): Replaced plain text areas with a powerful Rich Text Editor (Tiptap). Implemented direct image uploads using Supabase buckets with smart auto-cleanup logic. Integrated lightning-fast AI (`openai/gpt-oss-20b`) to help writers polish their drafts and readers summarize long posts. |
|5.1.0    | **28-Jun-2026** | Added infinitely nested comments (replies) using an efficient Adjacency List model in PostgreSQL. The project seems nearly complete except I'll add optional email authentication and admin panel in future after that, I'll just maintain it with minor changes and updates as I'll be busy with other projects. |
|5.1.1    | **29-Jun-2026** | Fixed the issue where the rich text editor toolbar was overlapped by mobile context menu when selecting text. |
|6.0.0    | **30-Jun-2026** | **The Final Major Update**: Added an Admin Panel for moderation (ban users, delete inappropriate content) plus Email Authentication and Password Recovery. Users can now verify emails with a 6-digit OTP, sign in with email, and reset passwords via "Forgot Password." The platform is now officially feature-complete! |

## Screenshots

### Landing Page
<img width="1280" height="606" alt="Landing Page" src="https://github.com/user-attachments/assets/46054b3c-0154-4649-a19c-a1cb4124455b" />

Modern landing page introducing **The Blog Zone**, featuring a clean dark-themed interface, project branding, and quick access to the blogging dashboard for authenticated users.

---

### Dashboard
<img width="1280" height="612" alt="Dashboard" src="https://github.com/user-attachments/assets/f758ab9b-68d8-4a7e-af71-9581fefe3655" />

The central workspace for browsing articles, managing blog posts, searching content, and accessing public or private blogging features.

---

### Private Dashboard
<img width="1280" height="612" alt="Private Dashboard" src="https://github.com/user-attachments/assets/f3f360f8-9527-4104-81ca-b73d59254f85" />

Dedicated workspace for encrypted private posts. Only the author can decrypt and access their content, ensuring privacy through server-side AES encryption.

---

### Create Blog
<img width="1280" height="612" alt="Create Blog" src="https://github.com/user-attachments/assets/4eee9f9c-4767-4c4b-961f-e163ed6859e4" />

Feature-rich editor powered by **Tiptap** with rich text formatting, image uploads, AI-assisted writing, and support for both public and encrypted private posts.

---

### Blog Post & Discussions
<img width="1280" height="612" alt="Blog Post & Discussions" src="https://github.com/user-attachments/assets/9ca05db2-5626-4440-a8fb-4ae14cc61573" />

Individual post page featuring rich text rendering, AI-generated summaries, and infinitely nested discussions for engaging conversations.

---

### Profile & Settings
<img width="1349" height="647" alt="image" src="https://github.com/user-attachments/assets/1816d579-d9bb-49a5-8f81-5dab0d38aa5d" />

Centralized profile page where users can manage posts, review discussion history, update account settings, and link an email for secure account recovery.

---

### Admin Dashboard
<img width="1280" height="606" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/bc6a079a-6ef1-4734-92cc-d8832b2da2ce" />

A dedicated administration portal secured with isolated JWT authentication, providing user moderation, account banning, searchable content management, permanent account deletion with automatic image cleanup, and one-click removal of inappropriate public posts.
