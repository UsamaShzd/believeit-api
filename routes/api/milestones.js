const express = require("express");
const _ = require("lodash");
const uuid = require("uuid");
const moment = require("moment");

const Milestone = require("../../models/Milestone");

const authorize = require("../../middlewares/authorize");
const requestValidator = require("../../middlewares/requestValidator");

const {
  createMilestoneSchema,
  editMilestoneSchema,
  changeMilestoneStatusSchema,
  markDayAsCompletedSchema,
} = require("../../validators/milestone");

const { ADMIN } = require("../../enums/roles");
const validateObjectId = require("../../helpers/validateObjectId");

const { getDatesOfRepeatingDays } = require("../../methods/milestone");

const router = express.Router();

router.get("/goal_milestones/:id", async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id))
    return res.status(404).send({ error: { message: "Invalid Goal Id." } });

  const milestones = await Milestone.find({
    goal: id,
  }).sort("startDate");

  res.send(milestones);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id))
    return res.status(404).send({ error: { message: "Milestone not found!" } });

  const milestone = await Milestone.findById(id);
  if (!milestone)
    return res.status(404).send({ error: { message: "Milestone not found!" } });

  res.send(milestone);
});

router.post(
  "/create_milestone",
  authorize(),
  requestValidator(createMilestoneSchema),
  async (req, res) => {
    const body = _.pick(req.body, [
      "title",
      "goal",
      "frequency",
      "startDate",
      "endDate",
      "repeatingDays",
      "timeOfDay",
    ]);

    const customIdentifier = uuid.v4();
    body.customIdentifier = customIdentifier;

    const { repeatingDays, startDate, endDate } = body;

    body.startDate = new Date(startDate);
    body.endDate = new Date(endDate);

    const { user } = req.authSession;

    if (repeatingDays.length > 0) {
      const repeatingDates = getDatesOfRepeatingDays(
        startDate,
        endDate,
        repeatingDays
      );
      body.repeatingDates = repeatingDates.map((d) =>
        moment(d).format("MM/DD/YYYY")
      );
    }

    const milestone = await new Milestone({
      ...body,
      createdBy: user._id,
    }).save();
    res.send(milestone);
  }
);

// router.put(
//   "/rearrange",
//   requestValidator(rearrangeSubMilestonesSchema),
//   authorize(),
//   async (req, res) => {
//     const { orderIds } = _.pick(req.body, ["orderIds"]);
//     let sortQueryPromises = orderIds.map((id, index) => {
//       return Milestone.findByIdAndUpdate(id, { sortOrder: index });
//     });
//     await Promise.all(sortQueryPromises);
//     res.send({ message: "Successfully Sorted!" });
//   }
// );

router.put(
  "/mark_day_as_completed/:id",
  requestValidator(markDayAsCompletedSchema),
  authorize(),
  async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id))
      return res
        .status(404)
        .send({ error: { message: "Milestone not found!" } });

    const { completionDate } = _.pick(req.body, ["completionDate"]);
    const milestone = await Milestone.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          completedDates: completionDate,
        },
      },
      { new: true }
    );

    res.send(milestone);
  }
);
router.put(
  "/change_status/:id",
  requestValidator(changeMilestoneStatusSchema),
  authorize(),
  async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id))
      return res
        .status(404)
        .send({ error: { message: "Milestone not found!" } });

    const body = _.pick(req.body, ["isCompleted"]);

    const milestone = await Milestone.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!milestone)
      return res
        .status(404)
        .send({ error: { message: "Milestone not found!" } });

    res.send(milestone);
  }
);

router.put(
  "/:id",
  authorize(ADMIN),
  requestValidator(editMilestoneSchema),
  async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id))
      return res
        .status(404)
        .send({ error: { message: "Milestone not found!" } });

    const body = _.pick(req.body, ["title", "startDate", "endDate"]);

    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);

    const milestone = await Milestone.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!milestone)
      return res
        .status(404)
        .send({ error: { message: "Milestone not found!" } });

    res.send(milestone);
  }
);

router.delete("/:id", authorize(), async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id))
    return res.status(404).send({ error: { message: "Milestone not found!" } });

  const milestone = await Milestone.findByIdAndDelete(id);

  if (!milestone)
    return res.status(404).send({ error: { message: "Milestone not found!" } });

  res.send(milestone);
});

module.exports = router;
