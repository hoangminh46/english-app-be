const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Note = require('../models/Note');
const config = require('./config');

// Serialize user để lưu vào session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientID,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm user theo googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User đã tồn tại, cập nhật thông tin và lastLogin
          user.name = profile.displayName;
          user.email = profile.emails[0].value;
          user.picture = profile.photos[0]?.value || null;
          user.firstName = profile.name?.givenName || null;
          user.lastName = profile.name?.familyName || null;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        } else {
          // User mới, tạo tài khoản mới
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value || null,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            lastLogin: new Date(),
            // audience mặc định là null, user sẽ chọn sau khi đăng nhập lần đầu
          });

          // Tạo document Note mặc định với 3 mảng rỗng cho user mới
          try {
            await Note.create({
              userId: user._id,
              vocabulary: [],
              formula: [],
              other: []
            });
            console.log(`✅ Đã tạo notes document mặc định cho user ${user._id}`);
          } catch (noteError) {
            console.error('❌ Error creating default notes:', noteError);
            console.error('Error details:', JSON.stringify(noteError, null, 2));
            // Không throw error để không làm gián đoạn quá trình đăng nhập
          }

          return done(null, user);
        }
      } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

