import axios from 'axios';

const EXPLORE_POSTS_QUERY = `{
    posts(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      profileId {
        id
        creator
      }
    }
  }`;

const APIURL = 'https://api.thegraph.com/subgraphs/name/anudit/lens-protocol';

export async function queryPosts() {
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
