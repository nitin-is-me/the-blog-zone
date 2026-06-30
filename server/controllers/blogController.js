const BlogPost = require('../models/BlogPost');
const jwt = require("jsonwebtoken");
const Comment = require('../models/Comment');
const Blogger = require('../models/Blogger');
const { encrypt, decrypt } = require('../utils/crypto-utils'); // Import the crypto utilities
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper to extract image URLs from HTML content
const extractImageUrls = (htmlContent) => {
  if (!htmlContent) return [];
  const urls = [];
  const regex = /<img[^>]+src="([^">]+)"/g;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

// Helper to delete images from Supabase bucket
const deleteSupabaseImages = async (urls) => {
  if (!supabase || !urls || urls.length === 0) return;
  try {
    const filePaths = urls
      .filter(url => url.includes('/storage/v1/object/public/blog-images/'))
      .map(url => {
        const parts = url.split('/blog-images/');
        return parts.length > 1 ? parts[1] : null;
      })
      .filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from('blog-images').remove(filePaths);
    }
  } catch (error) {
    console.error('Error deleting images from Supabase:', error);
  }
};

// Create a new blog post
exports.postBlog = async (req, res) => {
  try {
    const { title, content, private, thumbnail } = req.body;

    // Extracting user info from the jwt
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a post.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id; // The user id, needed for creating post (author is object id)

    // Encrypt content and title if post is private
    const encryptedContent = private ? encrypt(content) : content;
    const encryptedTitle = private ? encrypt(title) : title;
    const encryptedThumbnail = private && thumbnail ? encrypt(thumbnail) : (thumbnail || null);

    // Creating a new blog post with the author's ID
    const newPost = await BlogPost.create({
      title: encryptedTitle,
      content: encryptedContent, // Store encrypted content if private
      thumbnail: encryptedThumbnail,
      authorId,
      private
    });

    // When returning the newly created post, decrypt if needed
    const responsePost = {
      ...newPost.get({ plain: true }),
      title: private ? title : newPost.title, // Return original title to user
      content: private ? content : newPost.content, // Return original content to user
      thumbnail: private && thumbnail ? thumbnail : newPost.thumbnail
    };

    res.status(201).json({
      message: 'Blog post created successfully!',
      blog: responsePost,
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};

// Fetching all blog posts
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.findAll({
      where: { private: false },
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name', 'createdAt'],
        },
        {
          model: Comment,
          attributes: ['content', 'createdAt'],
          include: {
            model: Blogger,
            attributes: ['name', 'username', 'createdAt'],
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Public posts aren't encrypted, so no need to decrypt

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// Fetching private blogs for a specific user
exports.getPrivateBlogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to fetch private posts.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const privatePosts = await BlogPost.findAll({
      where: { authorId: userId, private: true },
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Decrypt the content of each private post
    const decryptedPosts = privatePosts.map(post => {
      const plainPost = post.get({ plain: true });
      return {
        ...plainPost,
        title: decrypt(plainPost.title),
        content: decrypt(plainPost.content),
        thumbnail: plainPost.thumbnail ? decrypt(plainPost.thumbnail) : null
      };
    });

    res.status(200).json(decryptedPosts);
  } catch (error) {
    console.error("Error fetching private posts:", error);
    res.status(500).json({ error: "Failed to fetch private posts." });
  }
};

// Fetching a single blog post by its ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findByPk(id, {
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name', 'createdAt'],
        },
        {
          model: Comment,
          attributes: ['id', 'content', 'createdAt', 'parentId'],
          include: {
            model: Blogger,
            attributes: ['name', 'username', 'createdAt'],
          },
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if the post is private
    if (blog.private) {
      // If private, verify the user is authorized to view it
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: 'You must be logged in to view private posts.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Check if the user is the author
      if (blog.authorId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to view this private post.' });
      }

      // If authorized, decrypt the content and title
      const plainBlog = blog.get({ plain: true });
      plainBlog.title = decrypt(plainBlog.title);
      plainBlog.content = decrypt(plainBlog.content);
      if (plainBlog.thumbnail) plainBlog.thumbnail = decrypt(plainBlog.thumbnail);
      return res.status(200).json(plainBlog);
    }

    // For public posts, no decryption needed
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      return res.status(401).json({ message: 'You must be logged in to delete a post.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const blog = await BlogPost.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blog.authorId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }
    
    // Auto-cleanup images from Supabase
    let plainContent = blog.content;
    let plainThumbnail = blog.thumbnail;
    if (blog.private) {
      plainContent = decrypt(blog.content);
      if (plainThumbnail) plainThumbnail = decrypt(blog.thumbnail);
    }
    const urlsToDelete = extractImageUrls(plainContent);
    if (plainThumbnail) urlsToDelete.push(plainThumbnail);
    await deleteSupabaseImages(urlsToDelete);

    await blog.destroy();
    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// Post a comment on a blog post
exports.postComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a comment.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id;

    const comment = await Comment.create({
      content,
      authorId,
      postId,
      parentId: parentId || null
    });

    const blog = await BlogPost.findByPk(postId);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    await blog.addComment(comment);

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment", error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a comment.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id;
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId !== authorId){
      return res.status(401).json({ message: "You must be logged in to delete your comment"});
    }

    // Delete the comment
    await comment.destroy();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};


// Edit an existing blog post
exports.editBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, private, thumbnail } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "You must be logged in to edit a post." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const blog = await BlogPost.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    if (blog.authorId !== userId) {
      return res.status(403).json({ message: "You are not authorized to edit this post." });
    }

    // Auto-cleanup orphaned images
    let oldPlainContent = blog.content;
    let oldPlainThumbnail = blog.thumbnail;
    if (blog.private) {
      oldPlainContent = decrypt(blog.content);
      if (oldPlainThumbnail) oldPlainThumbnail = decrypt(blog.thumbnail);
    }
    const oldUrls = extractImageUrls(oldPlainContent);
    if (oldPlainThumbnail) oldUrls.push(oldPlainThumbnail);

    const newUrls = extractImageUrls(content || oldPlainContent);
    const newPlainThumbnail = thumbnail !== undefined ? thumbnail : oldPlainThumbnail;
    if (newPlainThumbnail) newUrls.push(newPlainThumbnail);

    const orphanedUrls = oldUrls.filter(url => !newUrls.includes(url));
    await deleteSupabaseImages(orphanedUrls);

   // Handle privacy status changes and content updates
    let updatedContent = content || blog.content;
    let updatedTitle = title || blog.title;
    let updatedThumbnail = thumbnail !== undefined ? thumbnail : blog.thumbnail;
    
    // If privacy status is changing or content/title is being updated
    if (blog.private) {
      // If currently private
      if (private === false) {
        // Changing to public - decrypt existing fields if no new values provided
        updatedContent = content || decrypt(blog.content);
        updatedTitle = title || decrypt(blog.title);
        updatedThumbnail = thumbnail !== undefined ? thumbnail : (blog.thumbnail ? decrypt(blog.thumbnail) : null);
      } else {
        // Staying private
        // If new content provided, encrypt it
        if (content) {
          updatedContent = encrypt(content);
        }
        // If new title provided, encrypt it
        if (title) {
          updatedTitle = encrypt(title);
        }
        // If new thumbnail provided, encrypt it
        if (thumbnail !== undefined) {
          updatedThumbnail = thumbnail ? encrypt(thumbnail) : null;
        }
      }
    } else {
      // If currently public
      if (private) {
        // Changing to private - encrypt all fields
        updatedContent = encrypt(content || blog.content);
        updatedTitle = encrypt(title || blog.title);
        updatedThumbnail = (thumbnail !== undefined ? thumbnail : blog.thumbnail) ? encrypt(thumbnail !== undefined ? thumbnail : blog.thumbnail) : null;
      }
      // If staying public, no encryption needed
    }

    // Update the blog post
    blog.title = updatedTitle;
    blog.content = updatedContent;
    blog.thumbnail = updatedThumbnail;
    blog.private = private !== undefined ? private : blog.private;

    const updatedBlog = await blog.save();
    
    // Return the decrypted content to the client
    const responseBlog = updatedBlog.get({ plain: true });
    if (responseBlog.private) {
      responseBlog.title = decrypt(responseBlog.title);
      responseBlog.content = decrypt(responseBlog.content);
      if (responseBlog.thumbnail) responseBlog.thumbnail = decrypt(responseBlog.thumbnail);
    }
    
    res.status(200).json({ 
      message: "Blog post updated successfully!", 
      blog: responseBlog
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Failed to update blog post" });
  }
};

exports.extractImageUrls = extractImageUrls;
exports.deleteSupabaseImages = deleteSupabaseImages;

