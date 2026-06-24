import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET; //This secret is used to verify Clerk signatures.
    if (!signingSecret) {
      res.status(503).json({ message: "Webhook secret is not provided" });
      return;
    }

    // clerk's verifier expects a Web Request with the raw body; express.raw gives a Buffer.
    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);
    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    }); //This raw payload is needed because webhook signature verification works on the original bytes of the request. If the body gets parsed and changed, verification can fail.

    // throws if the signature is wrong or the body was tampered with; only then do we trust evt.
    const evt = await verifyWebhook(request, { signingSecret }); //Did this really come from Clerk?

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },// what do we have to find
        { clerkId: u.id, email, fullName, profilePic: u.image_url }, // what to store and update
        { new: true, upsert: true, setDefaultsOnInsert: true }, //new:true after updating return the updated document, 
      );
    }
// upsert:true->    If user exists → update.
// If user doesn't exist → create.

    if (evt.type === "user.deleted") {
      if (evt.data.id) await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in Clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
});

export default router;

// EXAMPLE OF EVT

// {
//   "data": {
//     "id": "user_29w83sxmDNGwOuEthce5gg56FcC",

//     "first_name": "Siddhant",
//     "last_name": "Roy",

//     "username": "sidroy",

//     "email_addresses": [
//       {
//         "id": "idn_123",
//         "email_address": "sid@gmail.com"
//       }
//     ],

//     "primary_email_address_id": "idn_123",

//     "image_url": "https://img.clerk.com/xxxxx",

//     "created_at": 1654012591514,
//     "updated_at": 1654012591835,

//     "phone_numbers": [],

//     "public_metadata": {},
//     "private_metadata": {},

//     "object": "user"
//   },

//   "instance_id": "ins_123",

//   "object": "event",

//   "timestamp": 1654012591835,

//   "type": "user.created"
// }