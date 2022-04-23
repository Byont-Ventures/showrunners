import abi from './abi.json';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';

@Service()
export default class NFTTransferChannel extends EPNSChannel {
    LAST_CHECKED_BLOCK

    constructor(@Inject('logger') public logger: Logger, @Inject('cached') public cached) {
    super(logger, {
      sdkSettings: {
        epnsCoreSettings: defaultSdkSettings.epnsCoreSettings,
        epnsCommunicatorSettings: defaultSdkSettings.epnsCommunicatorSettings,
        networkSettings: defaultSdkSettings.networkSettings,
      },
      networkToMonitor: config.web3MainnetNetwork,
      dirname: __dirname,
      name: 'NFT Trasfer',
      url: 'https://epns.io',
      useOffChain: true,
    });
  }

  async sendTransferEventNotif() {
    const sdk = await this.getSdk();
    const coven = await sdk.getContract('0x5180db8f5c931aae63c74266b211f580155ecac8', JSON.stringify(abi));
    const filter = await coven.contract.filters.Transfer();

    if (!this.LAST_CHECKED_BLOCK) {
      this.LAST_CHECKED_BLOCK = await coven.provider.getBlockNumber();
    }

    const toBlock = await coven.provider.getBlockNumber();
    this.logInfo(`No of events fetching events from  ${this.LAST_CHECKED_BLOCK} to ${toBlock}`);

    const events = await coven.contract.queryFilter(filter, this.LAST_CHECKED_BLOCK, toBlock);

    this.logInfo(`No of events fetched ${events.length}`);

    for (const evt of events) {
      const msg = `Coven #${evt.args.tokenId} transferred from ${evt.args.from} to ${evt.args.to}`;
      const payloadMsg = `Coven [b:#${evt.args.tokenId}] transferred\nFrom :  [s:${evt.args.from}]\nTo : [t:${evt.args.to}]`;
      const title = `Coven Transferred`;
      const payloadTitle = `Coven Transferred`;
      await this.sendNotification({
        title: title,
        payloadTitle: payloadTitle,
        message: msg,
        payloadMsg: payloadMsg,
        notificationType: 1,
        recipient: this.channelAddress,
        cta: `https://opensea.io/assets/0x5180db8f5c931aae63c74266b211f580155ecac8/${evt.args.tokenId}`,
        simulate: false,
        image: null,
      });
    }

    this.LAST_CHECKED_BLOCK = toBlock;
  }
}