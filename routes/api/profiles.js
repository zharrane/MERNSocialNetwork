const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const config = require("config");
const request = require("request");

//@route    GET api/profiles/me
//@desc     Get current user profile list
//@access   Private route
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      users: req.user.id,
    }).populate("users", ["name", "avatar"]);
    if (!profile) {
      console.log(profile);
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).sec("Server error");
  }
});

//@route    POST api/profiles
//@desc     Create or update auser profile
//@access   Private route
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile Object
    const profileFields = {};
    profileFields.users = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social Object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update the profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true },
        );
        return res.json(profile);
      }
      //Create the profile if not exist
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

//@route    GET api/profiles
//@desc     Get all profiles or specific
//@access   public route
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("users", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//@route    GET api/profiles/user/:user_id
//@desc     Get  profile by userid
//@access   public route
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      users: req.params.user_id,
    }).populate("users", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ message: "profile not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

//@route    DELETE api/profiles/user
//@desc     DELETE  profile by userid
//@access   private route
router.delete("/", auth, async (req, res) => {
  try {
    //delete profile
    await Profile.findOneAndRemove({ users: req.user.id });
    //delete user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ message: "user deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//@route    PUT api/profiles/experience
//@desc     PUT  Update profile data adding experience
//@access   private route
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company name is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) res.status(400).json({ errors: error.array() });
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ users: req.user.id });
      profile.experience.unshift(newExperience);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

//@route    DELETE api/profiles/experience/:exp_id
//@desc     DELETE  Update profile data removing an experience
//@access   private route
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ users: req.user.id });
    //Get index to remove
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex !== -1) profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error), res.status(500).json({ message: "Server error" });
  }
});

/** Add And delete education */
/** Add And delete education */
/** Add And delete education */
/** Add And delete education */

//@route    PUT api/profiles/education
//@desc     PUT  Update profile data adding education
//@access   private route
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) res.status(400).json({ errors: error.array() });
    const { school, degree, fieldofstudy, from, to, description } = req.body;
    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      description,
    };
    try {
      const profile = await Profile.findOne({ users: req.user.id });
      profile.education.unshift(newEducation);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

//@route    DELETE api/profiles/education/:edu_id
//@desc     DELETE  Update profile data removing an experience
//@access   private route
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ users: req.user.id });
    //Get index to remove
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    if (removeIndex !== -1) profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error), res.status(500).json({ message: "Server error" });
  }
});

//@route    Get api/profiles/github/:username
//@desc     Get  user github
//@access   public route
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sprt=created:asc&client_id=${config.get(
        "githubApiClientId",
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200)
        return res.status(404).json({ message: "No github profile found" });
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
