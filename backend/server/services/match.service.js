import { Chat } from '../models/Chat.js';
import { Match } from '../models/Match.js';
import { Swipe } from '../models/Swipe.js';
import { generateCompatibility } from './ai.service.js';
import { createNotification } from './notification.service.js';

const createLikeNotification = async ({ io, from, to, action, swipeId }) => {
  const title = action === 'super_like' ? 'Super like received' : 'New like received';
  const verb = action === 'super_like' ? 'super liked' : 'liked';
  return createNotification({
    io,
    user: to._id,
    type: 'like',
    title,
    body: `${from.nickname} ${verb} you`,
    data: { user: from._id, action, swipe: swipeId }
  });
};

export const handleSwipe = async ({ from, to, action, io }) => {

  const existedBefore = await Swipe.findOne({ from: from._id, to: to._id });
  let swipe = existedBefore;
  if (!swipe) {
    swipe = await Swipe.create({
      from: from._id,
      to: to._id,
      college: from.college._id || from.college,
      action,
      rewound: false
    });
  } else {
    // Optionally update action if needed
    if (swipe.action !== action || swipe.rewound) {
      swipe.action = action;
      swipe.rewound = false;
      swipe.college = from.college._id || from.college;
      await swipe.save();
    }
  }

  if (!['right', 'super_like'].includes(action)) return { swipe, match: null };

  const reciprocal = await Swipe.findOne({ from: to._id, to: from._id, action: { $in: ['right', 'super_like'] } });
  if (!reciprocal) {
    if (!existedBefore || existedBefore.action !== action) {
      await createLikeNotification({ io, from, to, action, swipeId: swipe._id });
    }
    return { swipe, match: null };
  }

  const users = [from._id.toString(), to._id.toString()].sort();
  let match = await Match.findOne({ users });
  const wasActiveMatch = Boolean(match?.active);
  const compatibility = await generateCompatibility(from, to);
  let chat;

  if (!match) {
    match = await Match.create({
      users,
      college: from.college._id || from.college,
      revealLevel: 2,
      compatibility,
      active: true
    });

    chat = await Chat.findOneAndUpdate(
      { match: match._id },
      { type: 'match', match: match._id, participants: users, college: from.college._id || from.college },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else {
    match.compatibility = compatibility;
    match.college = from.college._id || from.college;
    match.revealLevel = 2;
    match.active = true;
    await match.save();
    chat = await Chat.findOneAndUpdate(
      { match: match._id },
      { type: 'match', match: match._id, participants: users, college: from.college._id || from.college },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  if (!wasActiveMatch) {
    await createNotification({
      io,
      user: from._id,
      type: 'match',
      title: 'You matched',
      body: `You matched with ${to.nickname}. Now you can go to chat.`,
      data: { match: match._id, chat: chat._id }
    });
    await createNotification({
      io,
      user: to._id,
      type: 'match',
      title: 'You matched',
      body: `You matched with ${from.nickname}. Now you can go to chat.`,
      data: { match: match._id, chat: chat._id }
    });
    io?.to(`user:${from._id}`).to(`user:${to._id}`).emit('match:new', { match, chat });
  }

  return { swipe, match, chat };
};
