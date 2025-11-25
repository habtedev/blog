const mongoose = require('mongoose');

const { Schema } = mongoose;

const DraftSchema = new Schema(
  {
    title: { type: String, trim: true, default: '' },
    content: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Writer', default: null },
    authorName: { type: String, default: 'Anonymous' },
    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.BlogDraft || mongoose.model('BlogDraft', DraftSchema);
