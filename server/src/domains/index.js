// Central domain exports — convenience layer that groups domain modules.
// This file is optional. It helps when you want to import domain pieces
// from a single place, for example: `const { blog, writer } = require('./domains');`

module.exports = {
	blog: {
		model: require('./blog/blog.model'),
		service: require('./blog/blog.service'),
		controller: require('./blog/blog.controller'),
		validation: require('./blog/blog.validation'),
	},
	writer: {
		model: require('./writer/writer.model'),
		service: require('./writer/writer.service'),
		controller: require('./writer/writer.controller'),
		validation: require('./writer/writer.validation'),
	},
};
