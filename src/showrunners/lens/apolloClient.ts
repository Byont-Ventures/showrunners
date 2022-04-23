import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import fetch from 'cross-fetch';

const APIURL = 'https://api-mumbai.lens.dev/';

// https://stackoverflow.com/questions/40792344/does-apollo-client-work-on-node-js
export const apolloClient= new ApolloClient({
  link: new HttpLink({ uri: APIURL, fetch }),
  cache: new InMemoryCache(),
});