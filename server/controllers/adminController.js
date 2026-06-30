const jwt = require("jsonwebtoken");
const Blogger = require("../models/Blogger");
const BlogPost = require("../models/BlogPost");
const { extractImageUrls, deleteSupabaseImages } = require("./blogController");
const { decrypt } = require('../utils/crypto-utils');

exports.adminLogin = async (req, res) => {
  const { password } = req.body;
  
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ message: "ADMIN_PASSWORD not configured on server" });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, message: "Admin authenticated" });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Blogger.findAll({
      attributes: ['id', 'username', 'name', 'isBanned', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Blogger.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle ban" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Blogger.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Clean up images from all their posts before deleting
    const posts = await BlogPost.findAll({ where: { authorId: id } });
    for (let post of posts) {
      let plainContent = post.content;
      let plainThumbnail = post.thumbnail;
      if (post.private) {
        plainContent = decrypt(post.content);
        if (plainThumbnail) plainThumbnail = decrypt(post.thumbnail);
      }
      
      const urlsToDelete = extractImageUrls(plainContent);
      if (plainThumbnail) urlsToDelete.push(plainThumbnail);
      
      await deleteSupabaseImages(urlsToDelete);
    }

    await user.destroy();
    res.json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.getPublicPosts = async (req, res) => {
  try {
    const posts = await BlogPost.findAll({
      where: { private: false },
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findOne({ where: { id, private: false } });
    if (!post) {
      return res.status(404).json({ message: "Public post not found" });
    }
    
    const urlsToDelete = extractImageUrls(post.content);
    if (post.thumbnail) urlsToDelete.push(post.thumbnail);
    await deleteSupabaseImages(urlsToDelete);

    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
