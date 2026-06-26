import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export async function getUserforSideBar(req, res) {
  try {
    const loggedInUser = req.user._id;

    // ✅ Added `await` — without it, Mongoose returns a Promise object, not the data
    const everyoneExceptMe = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-clerkId",
    );
    res.status(200).json(everyoneExceptMe);
  } catch (error) {
    console.error("Error in getting users in the side bar", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      //i want the msg i receive or get
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },

      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// after 3rd step
// [
//   {
//     _id: "Rahul",
//     lastMessageAt: "11:00"
//   },
//   {
//     _id: "Aman",
//     lastMessageAt: "09:00"
//   }
// ]

//after 4th step
// {
//   _id: "Rahul",
//   lastMessageAt: "11:00",
//   user: [
//     {
//       _id: "Rahul",
//       fullName: "Rahul Sharma",
//       profilePic: "rahul.jpg",
//       clerkId: "abc"
//     }
//   ]
// }

// after 5th step
// {
//   _id: "Rahul",
//   fullName: "Rahul Sharma",
//   profilePic: "rahul.jpg",
//   clerkId: "abc"
// }

// after 6th step
// {
//   _id: "Rahul",
//   fullName: "Rahul Sharma",
//   profilePic: "rahul.jpg",

// }

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); //createdat=1 ascending createdat=-1 descending

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error while getting message: ", error.message);
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}

export async function sendMessage(req, res) {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text } = req.body;

    let imageUrl;
    let videoUrl;

    // Handle optional file/media upload
    if (req.file) {
      if (!hasImageKitConfig) {
        // ImageKit not configured — reject media upload requests
        return res.status(500).json({
          message: "Media upload is not configured on this server",
        });
      }
      // ✅ Moved upload OUTSIDE the !hasImageKitConfig block so it actually runs
      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    // Emit to the receiver's socket if they are online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // ✅ io is now imported from socket.js
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error while sending message: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
