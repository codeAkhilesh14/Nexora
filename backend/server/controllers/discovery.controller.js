import { Chat } from '../models/Chat.js';
import { Match } from '../models/Match.js';
import { RadarEvent } from '../models/RadarEvent.js';
import { Swipe } from '../models/Swipe.js';
import { User } from '../models/User.js';
import { handleSwipe } from '../services/match.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const anonymousProjection = 'nickname avatar branch year gender interests vibeTags musicTaste prompts relationshipGoals premium revealLevel';

const getProfileWords = (user) => {
  const words = [];
  
  const addText = (text) => {
    if (!text) return;
    const cleanText = text.toString().toLowerCase().replace(/[^\w\s-]/g, ' ');
    const parts = cleanText.split(/\s+/).filter(Boolean);
    words.push(...parts);
  };

  addText(user.bio);
  addText(user.branch);
  
  (user.interests || []).forEach(item => addText(item));
  (user.vibeTags || []).forEach(item => addText(item));
  (user.musicTaste || []).forEach(item => addText(item));
  (user.studyInterests || []).forEach(item => addText(item));
  (user.relationshipGoals || []).forEach(item => addText(item));

  (user.prompts || []).forEach(prompt => {
    addText(prompt.question);
    addText(prompt.answer);
  });

  const stopWords = new Set(['i', 'am', 'a', 'the', 'and', 'to', 'in', 'is', 'of', 'for', 'on', 'with', 'at', 'my', 'me', 'you', 'he', 'she', 'they', 'it', 'was', 'were', 'or', 'this', 'that', 'your']);
  const filteredWords = words.filter(w => !stopWords.has(w) && w.length > 1);
  return new Set(filteredWords);
};

export const calculateMatchPercentage = (user1, user2) => {
  const words1 = getProfileWords(user1);
  const words2 = getProfileWords(user2);

  const hash = (parseInt(user1._id.toString().slice(-4), 16) || 0) + (parseInt(user2._id.toString().slice(-4), 16) || 0);
  const baseMatch = 30 + (hash % 10); // Base is 30%-39%

  if (words1.size === 0 || words2.size === 0) {
    return baseMatch;
  }

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  const jaccard = union.size > 0 ? intersection.size / union.size : 0;

  const finalPercentage = Math.round(baseMatch + (jaccard * (99 - baseMatch)));
  return finalPercentage;
};
const matchedProjection = `${anonymousProjection} realPhoto realPhotoVisibleToMatches`;
const SWIPE_LIMITS = { pulse_pro: 20, orbit_z: 30, nebula_x: Infinity, spark: 20, plus: 30, max: Infinity };
const FREE_SWIPE_LIMIT = 5;

const getUserSwipeLimit = (user) => {
  if (!user.premium?.active) return FREE_SWIPE_LIMIT;
  return SWIPE_LIMITS[user.premium.plan] ?? 20;
};

const resetIfNewDay = async (user) => {
  const now = new Date();
  const lastReset = user.limits.resetAt ? new Date(user.limits.resetAt) : new Date(0);
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (lastReset < todayStart) {
    user.limits.chatsToday = 0;
    user.limits.swipesToday = 0;
    user.limits.resetAt = now;
    await user.save();
  }
};

const hidePrivatePhotoUnlessAllowed = (user) => {
  const profile = user.toObject ? user.toObject() : { ...user };
  if (!profile.realPhotoVisibleToMatches) delete profile.realPhoto;
  delete profile.realPhotoVisibleToMatches;
  return profile;
};

const radarZones = [
  'library',
  'cafeteria',
  'amenities',
  'college_gate',
  'mandir_area',
  'boys_hostel',
  'girls_hostel',
  'field',
  'basketball_court',
  'badminton_court',
  'volleyball_court',
  'first_year_block',
  'amphitheatre',
  'courtyard',
  'parking',
  'placement_cell_office',
  'registrar_office'
];

const radarZoneLabels = {
  library: 'Library',
  cafeteria: 'Cafeteria',
  amenities: 'Amenities',
  college_gate: 'College gate',
  mandir_area: 'Mandir area',
  boys_hostel: 'Boys hostel',
  girls_hostel: 'Girls hostel',
  field: 'Field',
  basketball_court: 'Basketball court',
  badminton_court: 'Badminton court',
  volleyball_court: 'Volleyball court',
  first_year_block: '1st year block',
  amphitheatre: 'Amphitheatre',
  courtyard: 'Courtyard',
  parking: 'Parking',
  placement_cell_office: 'Placement cell office',
  registrar_office: 'Registrar office'
};

export const getDeck = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Users dismissed (left swipe) within last 7 days - they reappear after 7 days
  const dismissedRecently = await Swipe.distinct('to', {
    from: req.user._id,
    action: 'left',
    rewound: false,
    createdAt: { $gte: sevenDaysAgo }
  });

  // Users liked/super_liked - hidden until match system resolves
  const liked = await Swipe.distinct('to', {
    from: req.user._id,
    action: { $in: ['right', 'super_like'] },
    rewound: false
  });

  // Exclude users already matched
  const activeMatches = await Match.distinct('users', {
    users: req.user._id,
    active: true
  });

  // Exclude users who are participants in a direct match chat
  const chatParticipants = await Chat.distinct('participants', {
    participants: req.user._id,
    type: 'match'
  });

  const blocked = req.user.safety.blockedUsers || [];
  const matchedUserIds = [
    ...activeMatches.map((id) => id.toString()),
    ...chatParticipants.map((id) => id.toString())
  ];

  const usersData = await User.find({
    _id: {
      $nin: [
        req.user._id,
        ...blocked,
        ...dismissedRecently,
        ...liked,
        ...matchedUserIds
      ]
    },
    status: 'active'
  })
    .select(anonymousProjection)
    .sort({ 'premium.active': -1, updatedAt: -1 })
    .lean();

  const users = usersData.map(u => ({
    ...u,
    matchPercentage: calculateMatchPercentage(req.user, u)
  }));
  ok(res, { users });
});

export const swipe = asyncHandler(async (req, res) => {
  const { targetUserId, action } = req.body;
  if (!['left', 'right', 'super_like'].includes(action)) throw new ApiError(400, 'Invalid swipe action');
  
  if (action === 'super_like') {
    const hasNebulaX = req.user.premium?.active && ['nebula_x', 'max'].includes(req.user.premium?.plan);
    if (!hasNebulaX) {
      throw new ApiError(403, 'Super Likes are exclusive to Nebula X premium members.');
    }
  }

  if (targetUserId === req.user._id.toString()) throw new ApiError(400, 'You cannot swipe on yourself');
  await resetIfNewDay(req.user);
  const swipeLimit = getUserSwipeLimit(req.user);
  if (swipeLimit !== Infinity && req.user.limits.swipesToday >= swipeLimit) {
    throw new ApiError(429, `Daily swipe limit reached (${swipeLimit}). Upgrade to Premium for more.`);
  }
  const target = await User.findOne({ _id: targetUserId, status: 'active' });
  if (!target) throw new ApiError(404, 'Campus profile not found');
  const result = await handleSwipe({ from: req.user, to: target, action, io: req.app.get('io') });
  req.user.limits.swipesToday += 1;
  await req.user.save();
  ok(res, result, result.match ? 'It is a match' : 'Swipe saved');
});

export const rewind = asyncHandler(async (req, res) => {
  if (!req.user.premium.active) throw new ApiError(402, 'Rewind is premium');
  const last = await Swipe.findOne({ from: req.user._id }).sort({ createdAt: -1 });
  if (!last) throw new ApiError(404, 'No swipe to rewind');
  last.rewound = true;
  await last.save();
  ok(res, { swipe: last }, 'Swipe rewound');
});

export const matches = asyncHandler(async (req, res) => {
  const data = await Match.find({ users: req.user._id, active: true }).populate('users', matchedProjection).sort({ updatedAt: -1 });
  const matches = data.map((match) => ({
    ...match.toObject(),
    users: match.users.map(hidePrivatePhotoUnlessAllowed)
  }));
  ok(res, { matches });
});

export const updateRadar = asyncHandler(async (req, res) => {
  const { zone } = req.body;
  if (!radarZones.includes(zone)) throw new ApiError(400, 'Invalid zone');
  req.user.locationSignal = { zone, updatedAt: new Date() };
  await req.user.save();
  await RadarEvent.create({ user: req.user._id, college: req.user.college._id, zone });

  const blocked = req.user.safety.blockedUsers || [];
  const activeMatchUserIds = await Match.distinct('users', {
    users: req.user._id,
    active: true
  });
  const chatUserIds = await Chat.distinct('participants', {
    participants: req.user._id,
    type: 'match'
  });
  const excludedUserIds = new Set([
    ...activeMatchUserIds.map((id) => id.toString()),
    ...chatUserIds.map((id) => id.toString())
  ]);

  const count = await User.countDocuments({
    _id: {
      $nin: [
        req.user._id,
        ...blocked,
        ...[...excludedUserIds].filter((id) => id !== req.user._id.toString())
      ]
    },
    status: 'active',
    'locationSignal.zone': zone,
    'locationSignal.updatedAt': { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
  });

  ok(res,
    { zone, count },
    count ? `You crossed paths with ${count} student${count > 1 ? 's' : ''} near ${radarZoneLabels[zone] || zone.replace('_', ' ')} today.` : 'Radar updated privately.'
  );
});

export const getRadarZoneUsers = asyncHandler(async (req, res) => {
  const { zone } = req.query;
  if (!radarZones.includes(zone)) throw new ApiError(400, 'Invalid zone');
  const blocked = req.user.safety.blockedUsers || [];

  const activeMatchUserIds = await Match.distinct('users', {
    users: req.user._id,
    active: true
  });
  const chatUserIds = await Chat.distinct('participants', {
    participants: req.user._id,
    type: 'match'
  });
  const excludedUserIds = new Set([
    ...activeMatchUserIds.map((id) => id.toString()),
    ...chatUserIds.map((id) => id.toString())
  ]);

  const usersData = await User.find({
    _id: {
      $nin: [req.user._id, ...blocked, ...[...excludedUserIds].filter((id) => id !== req.user._id.toString())]
    },
    status: 'active',
    'locationSignal.zone': zone,
    'locationSignal.updatedAt': { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
  })
    .select(anonymousProjection)
    .sort({ 'premium.active': -1, updatedAt: -1 })
    .limit(Number(req.query.limit || 20))
    .lean();

  const users = usersData.map(u => ({
    ...u,
    matchPercentage: calculateMatchPercentage(req.user, u)
  }));
  ok(res, { users, zone, label: radarZoneLabels[zone] || zone.replace('_', ' ') });
});

export const getSwipeLimits = asyncHandler(async (req, res) => {
  await resetIfNewDay(req.user);
  const limit = getUserSwipeLimit(req.user);
  const nextReset = new Date();
  nextReset.setUTCHours(24, 0, 0, 0);
  ok(res, {
    swipesUsed: req.user.limits.swipesToday,
    swipeLimit: limit === Infinity ? null : limit,
    unlimited: limit === Infinity,
    resetsAt: nextReset.toISOString()
  });
});
