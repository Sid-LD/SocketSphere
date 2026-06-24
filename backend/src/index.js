import express from "express";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";
import clerkWebhooks from './webhooks/clerk.webhook.js'

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

app.use('/api/webhooks/clerk', express.raw({type:'application/json'}), clerkWebhooks)

app.use(clerkMiddleware());
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Server is healthy",
  });
});

//// if the public directory exists send the static file
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}


app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port " + PORT);

  if(process.env.NODE_ENV==='production'){
    job.start()
  }

});
