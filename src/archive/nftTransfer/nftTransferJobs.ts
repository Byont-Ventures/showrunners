
import { Container } from 'typedi';
import schedule from 'node-schedule';
import NFTTransferChannel from './nftTransferChannel';

export default () => {
  const startTime = new Date(new Date().setHours(0, 0, 0, 0));
  const channel = Container.get(NFTTransferChannel);
  const tenMinuteRule = new schedule.RecurrenceRule();
  tenMinuteRule.minute = new schedule.Range(0, 59, 10);

  channel.logInfo(`-- 🛵 Scheduling Showrunner ${channel.cSettings.name} -  Channel [on 5 mins ]`);
  schedule.scheduleJob({ start: startTime, rule: tenMinuteRule }, async function () {
    const taskName = `${channel.cSettings.name} snapShotProposalsTask(false)`;
    try {
      await channel.sendTransferEventNotif();
      channel.logger.info(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logger.error(`❌ Cron Task Failed -- ${taskName}`);
      channel.logger.error(`Error Object: %o`, err);
    }
  });
};