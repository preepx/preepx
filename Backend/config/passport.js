const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), null);

        let user = await User.findOne({ email });

        if (user) {
          // Existing user — link Google account if not linked
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Handle Referral
        let referredBy = undefined;
        const stateReferralCode = req.query.state;
        if (stateReferralCode) {
          const referrer = await User.findOne({ referralCode: stateReferralCode });
          if (referrer) {
            referredBy = referrer._id;
            referrer.referralCount = (referrer.referralCount || 0) + 1;
            await referrer.save();
          }
        }

        // New user — create automatically
        const newReferralCode = "REF-" + crypto.randomBytes(3).toString("hex").toUpperCase();
        user = await User.create({
          fullName:   profile.displayName || email.split("@")[0],
          email,
          googleId:   profile.id,
          profilePic: profile.photos?.[0]?.value || null,
          referralCode: newReferralCode,
          referredBy,
        });

        const walletService = require("../src/modules/wallet/wallet.service");
        await walletService.addBonusToWallet(user._id, 20, "Signup bonus");

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
