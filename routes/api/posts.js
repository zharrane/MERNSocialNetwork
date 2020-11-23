const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const { route } = require("./users");

//@route    POST api/posts
//@desc     Create a Post
//@access   Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json({ post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

//@route    Get api/posts
//@desc     Get all Posts
//@access   Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route    Get api/post/id
//@desc     Get post by id
//@access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId")
      res.status(404).json({ message: "Post not found" });
    res.status(500).json({ message: "Server Error" });
  }
});

//@route    DELETE api/posts/:id
//@desc     DELETE A Post
//@access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Post not found
    if (!post) res.status(404).json({ message: "Post not found" });

    //Check user OwnerChip
    if (post.user.toString() !== req.user.id)
      res.status(401).json({ message: "User not autherized" });

    await post.remove();

    res.json({ message: "Post removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId")
      res.status(404).json({ message: "Post not found" });
    res.status(500).json({ message: "Server Error" });
  }
});

//@route    PUT api/posts/like/:id
//@desc     PUT ""Like a Post""
//@access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Post not found
    if (!post) res.status(404).json({ message: "Post not found" });
    //Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ message: "Post Aleady liked" });
    }

    //Adding the like
    post.likes.unshift({ user: req.user.id });

    //Save to database
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server Error" });
  }
});

//@route    PUT api/posts/unlike/:id
//@desc     PUT ""unLike a Post""
//@access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Post not found
    if (!post) res.status(404).json({ message: "Post not found" });
    //Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ message: "Post has not uet been liked" });
    }

    //Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    //Save to database
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId")
      res.status(404).json({ message: "Post not found" });
    res.status(500).send({ message: "Server Error" });
  }
});

//@route    POST api/posts/comment/:id
//@desc     Comment on a post
//@access   Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Write your comment please").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      //Post not found
      if (!post) res.status(404).json({ message: "Post not found" });

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error);
      if (error.kind === "ObjectId")
        res.status(404).json({ message: "Post not found" });
      res.status(500).send({ message: "Server Error" });
    }
  },
);

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Remove Comment from a post
//@access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id,
    );
    //Post not found
    if (!post) res.status(404).json({ message: "Post not found" });
    //No comment exist
    if (!comment) {
      return res.status(404).json({ message: "Comment does not exist" });
    }

    //Check user
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ message: "User not authorized" });

    //Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId")
      res.status(404).json({ message: "Post not found" });
    res.status(500).send({ message: "Server Error" });
  }
});
module.exports = router;
