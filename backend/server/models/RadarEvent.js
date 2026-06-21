import mongoose from 'mongoose';

const radarEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  zone: { type: String, enum: ['library', 'cafeteria', 'amenities', 'college_gate', 'mandir_area', 'boys_hostel', 'girls_hostel', 'field', 'basketball_court', 'badminton_court', 'volleyball_court', 'first_year_block', 'amphitheatre', 'courtyard', 'parking', 'placement_cell_office', 'registrar_office'], required: true },
  happenedAt: { type: Date, default: Date.now }
}, { timestamps: true });

radarEventSchema.index({ college: 1, zone: 1, happenedAt: -1 });
radarEventSchema.index({ happenedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 });

export const RadarEvent = mongoose.model('RadarEvent', radarEventSchema);
