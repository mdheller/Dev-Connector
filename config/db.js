const mongoose = require('mongoose');
const config = require('config');
const db = config.get('MongoURI');

const connectDB = async () => {
	// trycatch block always with async
	try {
		// await the promise from mongoose.connect
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
		console.log('Database connected...');
	} catch (err) {
		console.error(err.message);
		// Exit with failure
		process.exit(1);
	}
};

module.exports = connectDB;
