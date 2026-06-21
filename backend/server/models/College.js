import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  domains: [{ type: String, required: true, lowercase: true, trim: true }],
  city: { type: String, default: 'Delhi NCR' },
  zones: [{ type: String, enum: ['library', 'cafeteria', 'amenities', 'college_gate', 'mandir_area', 'boys_hostel', 'girls_hostel', 'field', 'basketball_court', 'badminton_court', 'volleyball_court', 'first_year_block', 'amphitheatre', 'courtyard', 'parking', 'placement_cell_office', 'registrar_office'] }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

collegeSchema.index({ code: 1 }, { unique: true });
collegeSchema.index({ domains: 1 }, { unique: true });

export const College = mongoose.model('College', collegeSchema);
