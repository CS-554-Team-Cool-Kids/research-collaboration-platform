import { messages as messageCollection } from "../config/mongoCollections.js";

export async function addMessage(message) {
  const messages = await messageCollection();
  await messages.insertOne(message);
}

export async function getMessagesByChannel(channelId) {
  const messages = await messageCollection();
  const allMessages = await messages
    .find({ channel: channelId })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  return allMessages.reverse();
}
