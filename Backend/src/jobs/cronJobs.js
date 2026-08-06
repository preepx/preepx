const User = require('../../models/User');

const resetDailyLoginRewards = async () => {
  try {
    console.log('[Cron] Running daily login reward reset...');
    // Pull "daily_login" from everyone's xpRewardsClaimed array
    const result = await User.updateMany(
      { xpRewardsClaimed: "daily_login" },
      { $pull: { xpRewardsClaimed: "daily_login" } }
    );
    console.log(`[Cron] Daily login reset complete. Modified ${result.modifiedCount} users.`);
  } catch (error) {
    console.error('[Cron] Error resetting daily login rewards:', error);
  }
};

const scheduleDailyMidnightJob = () => {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  console.log(`[Cron] Scheduled next daily reset in ${Math.round(msUntilMidnight / 60000)} minutes.`);

  setTimeout(() => {
    resetDailyLoginRewards();
    // Then run it every 24 hours
    setInterval(resetDailyLoginRewards, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

const initCronJobs = () => {
  scheduleDailyMidnightJob();
};

module.exports = initCronJobs;
