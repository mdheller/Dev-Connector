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
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('user', [
			'name',
			'avatar'
		]);

		if (!profile) {
			return res
				.status(400)
				.json({ msg: 'There is no profile for this user' });
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
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills
				.split(',')
				.map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			// Using upsert option (creates new doc if no match is found):
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true }
			);
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar'
		]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', [
			'name',
			'avatar'
		]);

		if (profile) return res.status(400).json({ msg: 'Profile not found' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		// Check if error kind is object id error
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route    DELETE api/profile
// @desc     Deletes profile, user and posts
// @access   Private
router.delete('/', auth, async (req, res) => {
	try {
		// todo - remove user posts

		// Remove user profile
		await Profile.findOneAndRemove({ user: req.user.id });

		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/profile/experience
// @desc     Update profile with experience
// @access   Private
router.put(
	'/experience/:exp_id',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty()
		]
	],
	async (req, res) => {
		// VAlidation errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Destructure req.body
		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		// Create new experience object and assign values from req.body title = title:title (shorthand)
		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		// Fetch & update profile from mongoDB
		try {
			// todo - Updating experience challenge

			// Fetch user profile from mongo
			const profile = await Profile.findOne({ user: req.user.id });

			// If update get id of experience and update
			if (req.params.exp_id) {
				const updateIndex = profile.experience
					.map((exp) => exp.id)
					.indexOf(req.params.exp_id);

				profile.experience.splice(updateIndex, 1, newExp);
			} else if (req.params.exp_id === 0) {
				profile.experience.unshift(newExp);
				await profile.save();
			}

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(400).send('Server Error');
		}
	}
);

// @route    DELETE api/profile
// @desc     Deletes profile, user and posts
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get remove index
		const removeIndex = profile.experience
			// map will return an array with all of the experience object id's
			.map((exp) => exp.id)
			// IndexOf will return the index of the id that matches the requested id
			.indexOf(req.params.exp_id);

		// here the splice method removes 1 object in the array from where removeIndex starts
		profile.experience.splice(removeIndex, 1);

		await profile.save();

		res.json({ msg: 'Experience deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * 
 */
// router.put('/experience/:exp_id', auth, async (req, res) => {
// 	try {
// 		const profile = await Profile.findOne({ user: req.user.id });

// 		// Get remove index
// 		const updateIndex = profile.experience
// 			// map will return an array with all of the experience object id's
// 			.map((exp) => exp.id)
// 			// IndexOf will return the index of the id that matches the requested id
// 			.indexOf(req.params.exp_id);

// 		// here the splice method removes 1 object in the array from where removeIndex starts
// 		profile.experience.splice(removeIndex, 1);

// 		await profile.save();

// 		res.json({ msg: 'User deleted' });
// 	} catch (err) {
// 		console.error(err.message);
// 		res.status(500).send('Server Error');
// 	}
// });

module.exports = router;
