import { Container } from 'typedi';
import schedule from 'node-schedule';
import LensChannel from './lensChannel';
import { getBlockNumber } from './api/theGraph';

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

export default () => {
  const startTime = new Date(new Date().setHours(0, 0, 0, 0));
  const channel = Container.get(LensChannel);

  const thirtySecondRule = new schedule.RecurrenceRule();

  thirtySecondRule.second = 30;
  let currentBlock = 99999999;

  channel.logInfo(`-- 🛵 Scheduling Showrunner ${channel.cSettings.name} -  Channel [on 30 seconds ]`);

  schedule.scheduleJob({ start: startTime, rule: thirtySecondRule }, async function () {
    const taskName = `${channel.cSettings.name} snapShotProposalsTask(false)`;
    try {
      channel.logger.info(`🐣 Cron Task Completed -- ${taskName}`);
      console.log('currentBlock:', currentBlock);
      await channel.sendDailyNewsletter(currentBlock);
      currentBlock = await getBlockNumber();
    } catch (err) {
      channel.logger.error(`❌ Cron Task Failed -- ${taskName}`);
      channel.logger.error(`Error Object: %o`, err);
    }
  });
  // const fifteenSecondRule = new schedule.RecurrenceRule();
  // fifteenSecondRule = new schedule.Range(15);

  channel.logInfo(`-- 🛵 Scheduling Showrunner ${channel.cSettings.name} -  Channel [on 15 secs ]`);
  schedule.scheduleJob('5    *    *    *    *    *', async function () {
    const taskName = `${channel.cSettings.name} - realtime notifications`;
    try {
      await channel.sendRealTimeNotifications();
      channel.logger.info(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logger.error(`❌ Cron Task Failed -- ${taskName}`);
      channel.logger.error(`Error Object: %o`, err);
    }
  });
};
