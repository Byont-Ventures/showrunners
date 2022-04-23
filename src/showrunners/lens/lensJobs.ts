
import { Container } from 'typedi';
import schedule from 'node-schedule';
import NFTTransferChannel from './lensChannel';

export default () => {
  const startTime = new Date(new Date().setHours(0, 0, 0, 0));
  const channel = Container.get(NFTTransferChannel);

  const tenSecondRule = new schedule.RecurrenceRule();

  tenSecondRule.second = 10;
  
  let lastTime = Date.now()

  // Can be used to quickly see what the query does
  channel.sendDailyNewsletter("1750751286");

  channel.logInfo(`-- 🛵 Scheduling Showrunner ${channel.cSettings.name} -  Channel [on 10 seconds ]`);
  schedule.scheduleJob({ start: startTime, rule: tenSecondRule }, async function () {
    const taskName = `${channel.cSettings.name} snapShotProposalsTask(false)`;
    try {
      console.log("lastTime:", lastTime.toString())
      await channel.sendDailyNewsletter(lastTime.toString());
      lastTime = Date.now()
      channel.logger.info(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logger.error(`❌ Cron Task Failed -- ${taskName}`);
      channel.logger.error(`Error Object: %o`, err);
    }
  });
};