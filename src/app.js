import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // Allows cookies to be sent with requests from the specified origin
  })
);

app.use(express.json({ limit: "16kb" })); // Parses JSON data sent in the request body (like from a POST request).
// The limit option specifies the maximum size of the JSON payload that can be parsed.
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //Parses data sent from HTML forms (like <form method="POST">).
app.use(express.static("public")); // Serves static files from the "public" directory
// This is useful for serving images, CSS files, and JavaScript files.
app.use(cookieParser()); // Parses cookies attached to the request object.
// This is useful for handling user sessions and authentication.

/*
What it does:

Parses cookies attached to incoming requests.

Turns cookie strings (like "user=john; auth=true") into an easy-to-use JavaScript object (req.cookies).

Why cookies matter:

Cookies are small pieces of data stored in the user's browser.

Commonly used for:

Session management (keeping users logged in)

Tracking user preferences

Storing small amounts of client-side data 
*/

// routes import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);

// http://localhost:8000/api/v1/users/register

export { app };
