/**
 * Expose
 */

module.exports = {
	db: 'mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE,
	// db: 'mongodb://localhost:27017/test',
	logDir: './logs/', //@todo : check if log directory exits, if not create one.
	sessionSecret: "thisisareallylongandbigsecrettoken",
	mongoose: {
		user: process.env.MONGO_USER,
		pass: process.env.MONGO_PASS,
		server: {
			socketOptions: {
				keepAlive: 1
			}
		}
	}
};