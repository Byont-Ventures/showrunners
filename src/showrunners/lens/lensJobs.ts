import { Container } from 'typedi';
import schedule from 'node-schedule';
import NFTTransferChannel from './lensChannel';
import { getBlockNumber } from './theGraph';

export default () => {
  const startTime = new Date(new Date().setHours(0, 0, 0, 0));
  const channel = Container.get(NFTTransferChannel);

  const thirtySecondRule = new schedule.RecurrenceRule();

  thirtySecondRule.second = 20;
  let currentBlock = 99999999

  channel.logInfo(`-- 🛵 Scheduling Showrunner ${channel.cSettings.name} -  Channel [on 30 seconds ]`);
  schedule.scheduleJob({ start: startTime, rule: thirtySecondRule }, async function () {
    const taskName = `${channel.cSettings.name} snapShotProposalsTask(false)`;
    try {
      console.log('currentBlock:', currentBlock);
      await channel.sendDailyNewsletter(currentBlock);
      currentBlock = await getBlockNumber();
      channel.logger.info(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logger.error(`❌ Cron Task Failed -- ${taskName}`);
      channel.logger.error(`Error Object: %o`, err);
    }
  });
};
