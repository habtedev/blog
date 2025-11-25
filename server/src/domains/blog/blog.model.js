const mongoose = require('mongoose');

const { Schema } = mongoose;

const BlogSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		// Link to Writer. Keep legacy authorName for quick display if needed.
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'Writer', default: null },
		authorName: { type: String, default: 'Anonymous' },
		tags: { type: [String], default: [] },
		published: { type: Boolean, default: false },
		// status: draft | published | archived
		status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
		// When the post was published (set when status transitions to 'published')
		publishedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
