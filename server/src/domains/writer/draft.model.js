const mongoose = require('mongoose');

const { Schema } = mongoose;

const DraftSchema = new Schema(
  {
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'Writer', required: true },
    title: { type: String, trim: true, default: '' },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.WriterDraft || mongoose.model('WriterDraft', DraftSchema);
