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
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
