import { Crush } from '../models/Crush.js';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { Chat } from '../models/Chat.js';
import { createNotification } from '../services/notification.service.js';
import { ok } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addCrush = asyncHandler(async (req, res) => {
  const targetEmail = req.body.targetEmail?.toLowerCase()?.trim();
  const nickname = req.body.nickname?.trim();
  const instagram = req.body.instagram?.trim();

  if (!targetEmail) {
    throw new ApiError(400, 'College email is required to add a secret crush.');
  }

  if (targetEmail === req.user.email?.toLowerCase()) {
    throw new ApiError(400, 'You cannot add yourself as a secret crush.');
  }

  // Find if target user is registered in the college
  const target = await User.findOne({ 
    college: req.user.college._id || req.user.college, 
    email: targetEmail 
  });

  const crush = await Crush.findOneAndUpdate(
    { owner: req.user._id, targetEmail },
    { 
      owner: req.user._id, 
      college: req.user.college._id || req.user.college, 
      targetEmail, 
      nickname, 
      instagram, 
      targetUser: target?._id 
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let revealed = null;

  if (target) {
    // Check if target user has also added current user as secret crush
    const reciprocal = await Crush.findOne({ 
      owner: target._id, 
      targetEmail: req.user.email?.toLowerCase() 
    });

    if (reciprocal) {
      crush.revealed = true;
      crush.revealedAt = new Date();
      reciprocal.revealed = true;
      reciprocal.revealedAt = new Date();
      
      // Update targetUser of reciprocal to point to current user if not already set
      reciprocal.targetUser = req.user._id;

      await Promise.all([crush.save(), reciprocal.save()]);

      // Create a Match document between the two users
      const users = [req.user._id.toString(), target._id.toString()].sort();
      let match = await Match.findOne({ users });
      if (!match) {
        match = await Match.create({
          users,
          college: req.user.college._id || req.user.college,
          revealLevel: 2,
          compatibility: { score: 95, explanation: "Matched via Secret Crush! 💖" },
          active: true
        });
      } else {
        match.active = true;
        await match.save();
      }

      // Create a Chat document between the two users
      const chat = await Chat.findOneAndUpdate(
        { match: match._id },
        { 
          type: 'match', 
          match: match._id, 
          participants: users, 
          college: req.user.college._id || req.user.college 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send professional match notifications to both users
      const io = req.app.get('io');
      await createNotification({ 
        io, 
        user: req.user._id, 
        type: 'match', 
        title: '❤️ Secret Crush Matched!', 
        body: 'You can now start chatting.', 
        data: { match: match._id, chat: chat._id } 
      });
      await createNotification({ 
        io, 
        user: target._id, 
        type: 'match', 
        title: '❤️ Secret Crush Matched!', 
        body: 'You can now start chatting.', 
        data: { match: match._id, chat: chat._id } 
      });

      // Emit new match socket event
      io?.to(`user:${req.user._id}`).to(`user:${target._id}`).emit('match:new', { match, chat });

      revealed = target;
    }
  }

  ok(res, { crush, revealed }, revealed ? 'It is mutual! ❤️ Secret Crush Matched!' : 'Secret crush saved successfully');
});

export const listCrushes = asyncHandler(async (req, res) => {
  const crushes = await Crush.find({ owner: req.user._id }).populate('targetUser', 'nickname avatar realPhoto revealLevel');
  ok(res, { crushes });
});
