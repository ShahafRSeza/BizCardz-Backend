const express = require("express");
const { User } = require("../models/User");
const auth = require("../middlewares/auth");
const joi = require("joi");
const _ = require("lodash");
const router = express.Router();

const ProfileSchema = joi.object({
  name: joi.string().required().min(2).max(1024),
  email: joi.string().required().min(5).max(1024).email(),
});

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id);
    res.status(200).send(_.pick(user, ["_id", "name", "email", "biz"]));
  } catch (err) {
    res.status(400).send("ERROR in GET User Profile");
  }
});

// Put Specific Card whos belong to Specific User:
router.put("/:id", auth, async (req, res) => {
  try {
    // Joi Validation:
    const { error } = ProfileSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOneAndUpdate(
      { _id: req.params.id, user_id: req.payload._id },
      req.body,
      { new: true }
    );
    if (!user) return res.status(400).send("User was not found");
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send("ERROR in PUT User");
  }
});

module.exports = router;
