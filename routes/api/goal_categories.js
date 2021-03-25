const express = require("express");
const _ = require("lodash");

const GoalCategory = require("../../models/GoalCategory");

const authorize = require("../../middlewares/authorize");
const requestValidator = require("../../middlewares/requestValidator");
const {
  createGoalCategorySchema,
  editGoalCategorySchema,
} = require("../../validators/goalCategory");

const { ADMIN } = require("../../enums/roles");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const category = await GoalCategory.findById(id);
  if (!category)
    return res
      .status(404)
      .send({ error: { message: "Goal Category not found!" } });

  res.send(category);
});

router.get("/", async (req, res) => {
  const categories = await GoalCategory.find().sort("name");
  res.send(categories);
});

router.post(
  "/",
  authorize(ADMIN),
  requestValidator(createGoalCategorySchema),
  async (req, res) => {
    const body = _.pick(req.body, ["name", "color"]);

    const category = await new GoalCategory(body).save();
    res.send(category);
  }
);

router.put(
  "/:id",
  authorize(ADMIN),
  requestValidator(editGoalCategorySchema),
  async (req, res) => {
    const { id } = req.params;
    const body = _.pick(req.body, ["name", "color"]);
    const category = await GoalCategory.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!category)
      return res
        .status(404)
        .send({ error: { message: "Goal Category not found!" } });

    res.send(category);
  }
);

router.delete("/:id", authorize(ADMIN), async (req, res) => {
  const { id } = req.params;
  const category = await GoalCategory.findByIdAndDelete(id);

  if (!category)
    return res
      .status(404)
      .send({ error: { message: "Goal Category not found!" } });

  res.send(category);
});

module.exports = router;
