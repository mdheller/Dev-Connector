const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// User model
const User = require('../../models/Users');

// @route POST api/users
// @desc  Register User
// @acces Public
router.post(
	'/',
	[
		check('name', 'A name is required').not().isEmpty(),
		check('email', 'Please fill in a valid email').isEmail(),
		check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
	],
	// Async with try catch block
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Destructuring req.body
		const { name, email, password } = req.body;

		try {
			// See if user exists
			// MongoDB query
			let user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({ errors: [ { msg: 'User already exists' } ] });
			}

			// Get users Gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});

			user = new User({
				name,
				email,
				avatar,
				password
			});

			// Encrypt password
			const salt = await bcrypt.genSalt();

			user.password = await bcrypt.hash(password, salt);

			await user.save();

			// Return JSON web token

			res.send('User registered');
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
