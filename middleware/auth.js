const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
	// Get token
	const token = req.header('x-auth-token');

	// Check for token presence
	if (!token) {
		return res.status(401).json({ msg: 'No token, not authorised' });
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		req.user = user.decoded;
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Token not valid' });
	}
};
