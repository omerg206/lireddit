import { NextPageContext } from 'next';
import { PaginatedPosts } from './../generated/graphql';
import createWithApollo from './create-with-apollo'
import { ApolloClient, InMemoryCache } from '@apollo/client';

const createClient = (ctx: NextPageContext | undefined) => new ApolloClient({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
  headers: {
    cookie: (typeof window === 'undefined' ? ctx?.req?.headers.cookie : undefined) || ""
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(
              existing: PaginatedPosts | undefined,
              incoming: PaginatedPosts
            ): PaginatedPosts {
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
});

export const withApollo = createWithApollo(createClient)