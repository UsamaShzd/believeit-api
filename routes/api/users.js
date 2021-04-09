const express = require("express");
const authorize = require("../../middlewares/authorize");

const _ = require("lodash");
const ImageMedia = require("../../models/media/ImageMedia");

const requestValidator = require("../../middlewares/requestValidator");
const { updateProfilePicSchema } = require("../../validators/users");
const sanitizeUser = require("../../sanitizers/user");

const router = express.Router();

router.put(
  "/update_profile_pic",
  requestValidator(updateProfilePicSchema),
  authorize(),
  async (req, res) => {
    const { image } = _.pick(req.body, ["image"]);

    const { user } = req.authSession;

    //making previous image unused
    if (user.image && user.image._id) {
      const previousImage = await ImageMedia.findByIdAndUpdate(
        user.image._id,
        {
          isUsed: false,
        },
        { new: true }
      );
    }

    const newImage = await ImageMedia.findByIdAndUpdate(
      image,
      { isUsed: true },
      { new: true }
    );
    if (!newImage)
      return res.status(404).send({
        error: {
          message: "Invalid image id",
        },
      });

    user.image = newImage;
    await user.save();

    res.send(sanitizeUser(user));
  }
);
module.exports = router;
