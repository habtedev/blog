const mongoose = require('mongoose');

const { Schema } = mongoose;

const WriterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    bio: { type: String },
    social: {
      twitter: { type: String },
      github: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Writer || mongoose.model('Writer', WriterSchema);
