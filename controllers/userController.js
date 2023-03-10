const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res) => {
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      const user = new User({
        username,
        email,
        password: hash,
      });

      user.save()
        .then(() => {
          res.status(201).json({
            message: 'User created successfully',
            user: {
              username: user.username,
              email: user.email,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: err });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed',
        });
      }

      bcrypt.compare(password, user.password)
        .then((result) => {
          if (!result) {
            return res.status(401).json({
              message: 'Authentication failed',
            });
          }

          const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
          );

          res.status(200).json({
            message: 'Authentication successful',
            token,
            expiresIn: 3600,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: err });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

exports.addFriend = (req, res) => {
  const { userId } = req.userData;
  const { friendId } = req.params;

  if (userId === friendId) {
    return res.status(400).json({
      message: 'You cannot add yourself as a friend',
    });
  }

  User.findByIdAndUpdate(
    userId,
    { $addToSet: { friends: friendId } },
    { new: true },
  )
    .populate('friends', 'username')
    .then((user) => {
      res.status(200).json({
        message: 'Friend added successfully',
        user,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

exports.getFriends = (req, res) => {
  const { userId } = req.userData;

  User.findById(userId)
    .populate('friends', 'username')
    .then((user) => {
      res.status(200).json({ friends: user.friends });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};
