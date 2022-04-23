import axios from 'axios';

import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';

const query = `
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
`;

export type followersOfAddres = {
  address: string;
  followers: Array<string>;
};

export async function queryFollowersOfSubscribers(subscribers: Array<string>) {
  // const followerList: Array<string>;

  subscribers.forEach(async (s) => {
    const response = await apolloClient.query({
      query: gql(query),
      variables: {
        request: {
          address: s,
        },
      },
    });
    // followerList.push({address: s, followers: response.data.following.items });
    console.log('Lens example data: ', JSON.stringify(response.data.following.items, null, 2));
  });
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

const EXPLORE_POSTS_QUERY = `{
    posts(first: 10, orderBy: timestamp, orderDirection: desc, where: {address: }) {
      id
      profileId {
        id
        creator
      }
    }
  }`;

const APIURL = 'https://api.thegraph.com/subgraphs/name/anudit/lens-protocol';

export async function queryFollowerPosts(address: string) {
  await axios
    .post(APIURL, {
      query: EXPLORE_POSTS_QUERY,
    })
    .then((res) => {
      console.log(JSON.stringify(res.data, null, 2));
      return res.data;
    })
    .catch((error) => {
      console.error(error);
      return '';
    });
}
