const mongoose = require('mongoose');

const { Schema } = mongoose;

const BlogSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		author: { type: String, default: 'Anonymous' },
		tags: { type: [String], default: [] },
		published: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
