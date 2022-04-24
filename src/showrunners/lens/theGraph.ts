import axios from 'axios';

import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';

export type addressHasNewPost = {
  id: string;
  hasNewPost: Boolean;
};

export type followersOfAddress = {
  address: string;
  followers: Array<addressHasNewPost>;
  followersHaveNewPosts: Boolean;
};

export async function queryFollowersOfSubscribers(subscribers: Array<string>): Promise<Array<followersOfAddress>> {
  const followerList = new Array<followersOfAddress>();

  for (let i = 0; i < subscribers.length; i++) {
    const s = subscribers[i];
    const response = await apolloClient.query({
      query: gql(`
      query($request: FollowingRequest!) {
        following(
          request: $request
        ) {
          items {
            profile {
              id
              handle
              ownedBy
            }
          }
        }
      }
      `),
      variables: {
        request: {
          address: s,
        },
      },
    });

    if (response.error) {
      continue;
    }

    let followersAddress: followersOfAddress = {
      address: s,
      followers: new Array<addressHasNewPost>(),
      followersHaveNewPosts: false,
    };

    // Fill the following list
    response.data.following.items.forEach((i) => {
      followersAddress.followers.push({ id: i.profile.id, hasNewPost: false });
    });

    followerList.push(followersAddress);
  }

  return followerList;
}

export async function queryFollowerPosts(
  followersOfSubscribers: Array<followersOfAddress>,
  sinceBlock: number,
): Promise<Array<followersOfAddress>> {
  for (let i = 0; i < followersOfSubscribers.length; i++) {
    for (let j = 0; j < followersOfSubscribers[i].followers.length; j++) {
      const response = await axios.post('https://api.thegraph.com/subgraphs/name/anudit/lens-protocol', {
        query: `{
          posts(where: {profileId: "${parseInt(
            followersOfSubscribers[i].followers[j].id,
            16,
          ).toString()}" _change_block: {number_gte: ${sinceBlock}}}) {
            id
            profileId {
              id
              creator
            }
          }
        }`,
      });

      try {
        if (response.data.data.posts.length > 0) {
          followersOfSubscribers[i].followers[j].hasNewPost = true;
          followersOfSubscribers[i].followersHaveNewPosts = true;
        }
      } catch (err) {
        console.log('Error pasing posts query:', err);
      }
    }
  }

  console.log('followersOfSubscribers:', JSON.stringify(followersOfSubscribers, null, 2));
  return followersOfSubscribers;
}

export async function getBlockNumber(): Promise<number> {
  const response = await axios.post('https://api.thegraph.com/subgraphs/name/anudit/lens-protocol', {
    query: `{
          _meta {
            block {
              number
            }
          }
        }`,
  });

  try {
    const blocknumber: number = response.data.data._meta.block.number;
    console.log('blocknumber:', blocknumber);
    return blocknumber;
  } catch (err) {
    console.log('Error getting block number:', err);
    return 0;
  }
}

export async function getHandleOfAddress(address: string): Promise<string> {
  const response = await axios.post('https://api.thegraph.com/subgraphs/name/anudit/lens-protocol', {
    query: `{
      profiles(where: {owner: "${address}"}) {
        handle
      }
    }`,
  });

  try {
    const handle: string = response.data.data.profiles[0].handle;
    console.log('handle:', handle);
    return handle;
  } catch (err) {
    console.log('Error getting handle:', err);
    return "";
  }
}