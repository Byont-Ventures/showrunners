import axios from 'axios';

import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';

export type addressHasNewPost = {
  id: string;
  hasNewPost: Boolean;
};

export type followersOfAddres = {
  address: string;
  followers: Array<addressHasNewPost>;
};

export async function queryFollowersOfSubscribers(subscribers: Array<string>): Promise<Array<followersOfAddres>> {
  const followerList = new Array<followersOfAddres>();

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

    let followersAddress: followersOfAddres = {
      address: s,
      followers: new Array<addressHasNewPost>(),
    };

    // Fill the following list
    response.data.following.items.forEach((i) => {
      followersAddress.followers.push({ id: i.profile.id, hasNewPost: false });
    });

    followerList.push(followersAddress);
  }

  console.log('followerList:', JSON.stringify(followerList, null, 2));
  return followerList;
}

/**
{
  profiles(where: {owner: "0x8AAA75Ae440fbCc6cF3F14Bc305221C97A251780"}) {
    id
    owner
    handle
    followNFTURI
  }
}
 */

/**
 * https://api-mumbai.lens.dev/

query {
  following(
    request: { address: "0x8AAA75Ae440fbCc6cF3F14Bc305221C97A251780" }
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


 */

export async function queryFollowerPosts(
  followersOfSubscribers: Array<followersOfAddres>,
  sinceTime: string,
): Promise<Array<followersOfAddres>> {
  for (let i = 0; i < followersOfSubscribers.length; i++) {
    for (let j = 0; j < followersOfSubscribers[i].followers.length; j++) {
      const response = await axios.post('https://api.thegraph.com/subgraphs/name/anudit/lens-protocol', {
        query: `{
          posts(where: {profileId: "${parseInt(
            followersOfSubscribers[i].followers[j].id,
            16,
          ).toString()}" timestamp_gt: "${sinceTime}"}) {
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
        }
      } catch (err) {
        console.log('Error pasing posts query:', err);
      }
    }
  }

  console.log('followersOfSubscribers:', JSON.stringify(followersOfSubscribers, null, 2));
  return followersOfSubscribers;
}
