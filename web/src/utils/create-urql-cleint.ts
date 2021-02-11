import { isServer } from './is-server';
import { stringifyVariables } from '@urql/core';
import { DeletePostMutationVariables, VoteMutationVariables } from './../generated/graphql';
import { cacheExchange, FieldInfo, Resolver, Cache } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange } from "urql";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from './betterUpdateQuery';
import { tap, pipe } from 'wonka';
import Router from 'next/router'
import gql from 'graphql-tag';


const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {

      if (error?.message.includes('not authenticated')) {
        Router.replace('/login')
      }
    })
  )
};

export const cursorPagination = (): Resolver => {

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) {
      return undefined;
    }

    const filedKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolveFieldByKey(entityKey, filedKey) as string, "posts");
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((info: FieldInfo) => {
      const key = cache.resolve(entityKey, info.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");

      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }

      results.push(...data)
    })

    return {
      __typename: "PaginatedPosts",
      hasMore, posts: results
    };

  };
};

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {})
  })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? {
        cookie
      } : undefined
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {
          Mutation: {
            deletePost: (_result, arg, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (arg as DeletePostMutationVariables).id
              });
            },
            vote: (_result, arg, cache, info) => {
              const { postId, value } = arg as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
                { id: postId }
              );


              if (data) {
                if ((data as any).voteStatus === arg.value) {
                  return;
                }
                const newPoints = ((data as any).points as number) + ((!(data as any).voteStatus ? 1 : 2) * value);
                cache.writeFragment(
                  gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, arg, cache, info) => {
              invalidateAllPosts(cache);
            },
            logout: (_result, arg, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, arg, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query; //me: null
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPosts(cache);
            },
            register: (_result, arg, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query; //me: null
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  }
}

