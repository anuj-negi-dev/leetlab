import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth-route.js";
import problemRouter from "./routes/problem-route.js";
import submissionRouter from "./routes/submission-route.js";
import playlistRouter from "./routes/playlist-route.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Hello from leetlab!",
  });
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/problems", problemRouter);

app.use("/api/v1/submissions", submissionRouter);

app.use("/api/v1/playlists", playlistRouter);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
