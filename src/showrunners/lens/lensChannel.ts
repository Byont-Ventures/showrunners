import lensHub from './lensHub.json';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { Contract, ethers } from 'ethers';
import Web3 from 'web3';
import { getSubscriberData, parseComment } from './parser';
import NotificationHelper from '@epnsproject/backend-sdk-staging';
import { queryFollowerPosts, queryFollowersOfSubscribers } from './theGraph';

const lensAddress = '0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0';
const providerApi = config.mumbaiApi;

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

  async sendNewFollowerNotifications(sdk: NotificationHelper, contract: Contract, beginBlock: number, toBlock: number) {
    const filter = contract.filters.FollowNFTTransferred();
    // console.log(contract.interface.getEvent('0x4996ad2257e7db44908136c43128cc10ca988096f67dc6bb0bcee11d151368fb'));
    // console.log(contract.interface.getEvent('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'));

    const events = await contract.queryFilter(filter, beginBlock, toBlock);

    console.log(`New Follower events: ${events.length}`);
    for (const event of events) {
      // BigNumber { _hex: '0x6263eae1', _isBigNumber: true },
      // profileId: BigNumber { _hex: '0x07', _isBigNumber: true },
      // followNFTId: BigNumber { _hex: '0x13', _isBigNumber: true },
      // from: '0x0000000000000000000000000000000000000000',
      // to: '0xB8189417c4B63c3F093fC0df72F64D983E904aF4',
      // timestamp: BigNumber { _hex: '0x6263eae1', _isBigNumber: true }
      const e = {
        profileId: event.args.profileId.toString(),
        followNFTId: event.args.followNFTId.toString(),
        from: event.args.from,
        to: event.args.to,
      };
      console.log(e);
    }
    console.log(`New follower events: ${events.length}`);
  }

  async sendPostCreationNotifications(contract, beginBlock: number, toBlock: number) {
    const filter = await contract.filters.PostCreated();
    const events = await contract.queryFilter(filter, beginBlock, toBlock);

    for (const evt of events) {
      const msg = `Post ${evt.args.pubId} made by #${evt.args.profileId} on: ${evt.args.timestamp}`;
      // const payloadMsg = `Coven [b:#${evt.args.tokenId}] transferred\nFrom :  [s:${evt.args.from}]\nTo : [t:${evt.args.to}]`;
      const title = `There's a new post!`;
      // //   const payloadTitle = `Coven Transferred`;
      console.log(msg);
    }
    console.log(`Got ${events.length} posts`);
  }

  async sendCommentNotifications(sdk: NotificationHelper, contract: Contract, beginBlock: number, toBlock: number) {
    const filter = await contract.filters.CommentCreated();
    const events = await contract.queryFilter(filter, beginBlock, toBlock);
    const subs = await sdk.getSubscribedUsers();
    console.log(`We've got ${subs.length} subs`);
    subs.forEach((sub) => console.log(JSON.stringify(sub)));

    // Determine who was the publisher to which the comment was meant
    // get Post for every comment
    // get PostWriter, crossreference it to subscribers -> Notify

    for (const event of events) {
      const comment = parseComment(event.args);
      const msg = `Post ${comment.postId} made by #${comment.profileId} on: ${comment.timeStamp}`;
      const title = `You've got a Comment!`;
      // const payloadMsg = `Coven [b:#${evt.args.tokenId}] transferred\nFrom :  [s:${evt.args.from}]\nTo : [t:${evt.args.to}]`;
      console.log(msg);
    }
    console.log(`Got ${events.length} comments`);
  }

  async sendRealTimeNotifications() {
    const sdk = await this.getSdk();
    const subs = getSubscriberData(await sdk.getSubscribedUsers());

    const provider = new ethers.providers.WebSocketProvider(providerApi);
    const contract = new ethers.Contract(lensAddress, lensHub, provider);

    if (!this.LAST_CHECKED_BLOCK) {
      this.LAST_CHECKED_BLOCK = 26057839; //await lens.provider.getBlockNumber();
      console.log(`Fetching events from now`);
    }
    const toBlock = provider.blockNumber;
    console.log(`Fetching events between ${this.LAST_CHECKED_BLOCK} and ${toBlock}`);

    // Todo: run these with Promise.all
    await this.sendNewFollowerNotifications(sdk, contract, this.LAST_CHECKED_BLOCK, toBlock);
    await this.sendCommentNotifications(sdk, contract, this.LAST_CHECKED_BLOCK, toBlock);
    // await this.sendPostCreationNotifications(lens.contract, this.LAST_CHECKED_BLOCK, toBlock);

    this.LAST_CHECKED_BLOCK = toBlock;
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
    try {
      let sdk = await this.getSdk();

      const subscribers = await sdk.getSubscribedUsers();
      const followersOfSubscribers = await queryFollowersOfSubscribers(subscribers);
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
