import abi from './abi.json';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { ethers } from 'ethers';

const provider = ethers.getDefaultProvider(config.web3PolygonMumbaiProvider, {
  etherscan: config.etherscanAPI ? config.etherscanAPI : null,
  infura: config.infuraAPI
    ? { projectId: config.infuraAPI.projectID, projectSecret: config.infuraAPI.projectSecret }
    : null,
  alchemy: config.alchemyAPI ? config.alchemyAPI : null,
});
const lensAddress = '0x4bf0c7ad32fd2d32089790a54485e23f5c7736c0';
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

  async sendRealtimenNotifications() {
    const sdk = await this.getSdk();
    const lens = await sdk.getContract(lensAddress, JSON.stringify(abi));
    lens.provider = provider;
    console.log(`The provider is: ${lens.provider.network.name}`);
    const filter = await lens.contract.filters.PostCreated();

    if (!this.LAST_CHECKED_BLOCK) {
      this.LAST_CHECKED_BLOCK = await lens.provider.getBlockNumber();
      console.log(`Fetching events from now`);
    }

    const toBlock = await lens.provider.getBlockNumber();
    this.logInfo(`No of events fetching events from  ${this.LAST_CHECKED_BLOCK} to ${toBlock}`);

    const events = await lens.contract.queryFilter(filter, this.LAST_CHECKED_BLOCK, toBlock);

    for (const evt of events) {
      const msg = `Post ${evt.args.pubId} made by #${evt.args.profileId} on: ${evt.args.timestamp}`;
      const payloadMsg = `Coven [b:#${evt.args.tokenId}] transferred\nFrom :  [s:${evt.args.from}]\nTo : [t:${evt.args.to}]`;
      // const title = `Coven Transferred`;
      // //   const payloadTitle = `Coven Transferred`;

      // await this.sendNotification({
      //   title: title,
      //   payloadTitle: payloadTitle,
      //   message: msg,
      //   payloadMsg: payloadMsg,
      //   notificationType: 1,
      //   recipient: this.channelAddress,
      //   cta: `https://opensea.io/assets/0x5180db8f5c931aae63c74266b211f580155ecac8/${evt.args.tokenId}`,
      //   simulate: false,
      //   image: null,
      // });
    }

    this.LAST_CHECKED_BLOCK = toBlock;

    // - ProfileCreated
    // - PostCreated
    // - ProfileCreatorWhitelisted
    // - FollowModuleWhitelisted
    // - ReferenceModuleWhitelisted
    // - CollectModuleWhitelisted
    // - DispatcherSet
    // - ProfileImageURISet
    // - FollowNFTURISet
    // - FollowModuleSet
    // - MirrorCreated
    // - CommentCreated
  }

  /**
   *  const APIURL = 'https://api.thegraph.com/subgraphs/name/anudit/lens-protocol'
      const EXPLORE_POSTS_QUERY = gql`
        query {
          posts(first: 10, orderBy: timestamp, orderDirection: desc) {
            id
            profileId {
              id
              creator
            }
          }
        }
   */
  async sendDailyNewsletter() {
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
