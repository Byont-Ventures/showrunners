import lensHub from './lensHub.json';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { BigNumber, Contract, ethers } from 'ethers';
import { parseComment } from './parser';
import NotificationHelper from '@epnsproject/backend-sdk-staging';
import {
  getSubscriberData,
  Profiles,
  getHandleOfAddress,
  queryFollowerPosts,
  queryFollowersOfSubscribers,
} from './theGraph';
import { getPublication } from './api/getPub';

const lensAddress = '0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0';
const providerApi = config.mumbaiApi;

@Service()
export default class LensChannel extends EPNSChannel {
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

  async sendRealTimeNotifications() {
    const sdk = await this.getSdk();
    const profiles = await getSubscriberData(await sdk.getSubscribedUsers());
    // console.log(profiles);
    // Todo: For big performane increase we can improve getSubscriberData
    const provider = new ethers.providers.WebSocketProvider(providerApi);
    const contract = new ethers.Contract(lensAddress, lensHub, provider);

    if (!this.LAST_CHECKED_BLOCK) {
      console.log(`No known last checked time: fetching events from now`);
      this.LAST_CHECKED_BLOCK = await provider.getBlockNumber(); //26060044;
    }
    const toBlock = await provider.getBlockNumber(); //provider.blockNumber;
    console.log(`Fetching events between ${this.LAST_CHECKED_BLOCK} and ${toBlock}`);

    // Todo: run these with Promise.all
    await this.sendNewFollowerNotifications(sdk, contract, this.LAST_CHECKED_BLOCK, toBlock, profiles);
    await this.sendCommentNotifications(sdk, contract, this.LAST_CHECKED_BLOCK, toBlock, profiles);

    this.LAST_CHECKED_BLOCK = toBlock;
  }

  async sendNewFollowerNotifications(
    sdk: NotificationHelper,
    contract: Contract,
    beginBlock: number,
    toBlock: number,
    profiles: Profiles,
  ) {
    const filter = contract.filters.FollowNFTTransferred();
    const events = await contract.queryFilter(filter, beginBlock, toBlock);
    let c = 0;
    for (const event of events) {
      // Todo: We should save count of how many new followers rather than send messages 1 by 1
      // RN we would send two messages if 2 follows were gained in 1 minute
      const pId = event.args.profileId as BigNumber;
      if (pId._hex in profiles) {
        const data = {
          profileId: event.args.profileId.toString(),
          followNFTId: event.args.followNFTId.toString(),
          from: event.args.from,
          to: event.args.to,
        };
        if (data.to === '0x0000000000000000000000000000000000000000') {
          // Someone unfollowed :(
        } else {
          c++;
          console.log(`Sending a new follower notification to: ${profiles[pId._hex].address}`);
          await this.sendNotification({
            title: 'A new follower!',
            payloadTitle: 'A new follower!',
            message: 'Check it out now',
            payloadMsg: 'Check it out now',
            notificationType: 3,
            recipient: profiles[pId._hex].address,
            cta: `https://lenster.xyz/u/${profiles.handle}`,
            simulate: false,
            image: null,
          });
        }
      } else {
        // ignore
      }
    }
  }

  // async sendPostCreationNotifications(contract, beginBlock: number, toBlock: number) {
  //   const filter = await contract.filters.PostCreated();
  //   const events = await contract.queryFilter(filter, beginBlock, toBlock);
  //   // To be implemented
  // }

  async sendCommentNotifications(
    sdk: NotificationHelper,
    contract: Contract,
    beginBlock: number,
    toBlock: number,
    profiles,
  ) {
    const filter = await contract.filters.CommentCreated();
    const events = await contract.queryFilter(filter, beginBlock, toBlock);

    // Determine who was the publisher to which the comment was meant
    // get Post for every comment
    // get PostWriter, crossreference it to subscribers -> Notify

    for (const event of events) {
      const comment = parseComment(event.args);
      const msg = `Post ${comment.postId} made by #${comment.profileId} on: ${comment.timeStamp} pubId: ${comment.internalPubId}`;
      console.log(msg);
      const pub = await getPublication(comment.internalPubId);
      const profileId = pub.mainPost.profile.id;
      if (profileId in profiles) {
        const profile = profiles[profileId];
        const writer = pub.profile.handle;
        console.log("We've got a match!");
        const title = `${writer} commented on your post`;
        const content = pub.metadata.content;

        await this.sendNotification({
          title,
          payloadTitle: title,
          message: content,
          payloadMsg: content,
          notificationType: 3,
          recipient: profile.address,
          cta: `https://lenster.xyz/posts/${pub.mainPost.id}`, // Note that if the user isnt logged in he will get a "client-side error"
          simulate: false,
          image: pub.profile.picture.original.url,
        });
      } else {
        // Post owner not in subs
      }
    }
    console.log(`Got ${events.length} comments`);
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

  async sendDailyNewsletter(lastBlock: number) {
    try {
      let sdk = await this.getSdk();

      const subscribers = await sdk.getSubscribedUsers();
      console.log('subscribers:', subscribers);
      const followersOfSubscribers = await queryFollowersOfSubscribers(subscribers);
      const followersOfSubscribersUpdated = await queryFollowerPosts(followersOfSubscribers, lastBlock);

      followersOfSubscribersUpdated.forEach(async (s) => {
        // Todo: If someone follows himself they will also get notified in this case
        if (s.followersHaveNewPosts) {
          const handle: string = await getHandleOfAddress(s.address);
          await this.sendNotification({
            title: 'New activity!',
            payloadTitle: 'New activity!',
            message: 'Your friends posted something new. Check it out!',
            payloadMsg: 'Your friends posted something new. Check it out!',
            notificationType: 3,
            recipient: s.address,
            cta: `https://lenster.xyz/u/${handle}`,
            simulate: false,
            image: null,
          });
        }
      });

      return { success: true };
    } catch (error) {
      this.logError(error);
    }
  }
}
