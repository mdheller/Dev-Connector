const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/Users');
const Profile = require('../../models/Profile');

// @route GET api/profile/me
// @desc  Get current Users profile
// @acces Private
router.get('/me', auth, async (req, res) => {
	try {
		// Get user profile frome database
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
			'name',
			'avatar'
		]);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route POST api/profile
// @desc  Create or Update user profile
// @acces Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty()
		]
	],
	async (req, res) => {}
);

module.exports = router;
