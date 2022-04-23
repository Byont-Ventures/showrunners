import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { queryFollowerPosts, queryFollowersOfSubscribers } from './theGraph';

@Service()
export default class LensChannel extends EPNSChannel {
  LAST_CHECKED_BLOCK;

  constructor(@Inject('logger') public logger: Logger, @Inject('cached') public cached) {
    super(logger, {
      sdkSettings: {
        epnsCoreSettings: defaultSdkSettings.epnsCoreSettings,
        epnsCommunicatorSettings: defaultSdkSettings.epnsCommunicatorSettings,
        networkSettings: defaultSdkSettings.networkSettings,
      },
      networkToMonitor: config.web3KovanNetwork,
      dirname: __dirname,
      name: 'Lens',
      url: 'https://lens.dev',
      useOffChain: true,
    });
  }

  async sendDailyNewsletter() {
    try {
      let sdk = await this.getSdk();

      const subscribers = await sdk.getSubscribedUsers()
      const followersOfSubscribers = await queryFollowersOfSubscribers(subscribers)
      //const res = queryFollowerPosts("")
      

      /*await this.sendNotification({
        title: 'title',
        payloadTitle: 'payloadTitle',
        message: 'msg',
        payloadMsg: 'payloadMsg',
        notificationType: 1,
        recipient: 'this.channelAddress',
        cta: `fhdsjaip${fds}`,
        simulate: false,
        image: null,
      });*/

      return { success: true };
    } catch (error) {
      this.logError(error);
    }
  }
}
