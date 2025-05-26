import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all subscription routes
router.use(verifyJWT);

// Toggle subscription
router.route("/c/:channelId").post(toggleSubscription);

// Get subscribers list
router.route("/c/subscribers/:channelId").get(getUserChannelSubscribers);

// Get subscribed channels list
router.route("/u/subscribed-channels/:subscriberId").get(getSubscribedChannels);

export default router;
