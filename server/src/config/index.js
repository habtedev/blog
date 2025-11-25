require('dotenv').config();

module.exports = {
	PORT: process.env.PORT || 8500,
	MONGO_URI: process.env.MONGO_URI,
};
