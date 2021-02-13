import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { EditDeletePostButtons } from "../components/edit-delete-post-buttons";
import { Layout } from "../components/layout";
import { UpdootSection } from "../components/updoot-section";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/with-apollo";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null },
    notifyOnNetworkStatusChange: true,
  });
  const { data: meData } = useMeQuery();

  if (!loading && !data) {
    return (
      <div>
        <div>you got query failed for some reason</div>
        <div>{error?.message} </div>
      </div>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>loading ...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shdaow="md" borderWidth="1px">
                <UpdootSection post={p}></UpdootSection>
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text> posted by {p.creator.username}</Text>
                  <Flex align="center">
                    <Text mt={4} flex={1}>
                      {p.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        id={p.id}
                        creatorId={p.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex my={8} m="auto" justifyContent="center">
          <Button
            isLoading={loading}
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (prevValues, { fetchMoreResult }): PostQuery => {
                //   if (!fetchMoreResult) {
                //     return prevValues as PostQuery;
                //   } else {
                //     return {
                //       __typename: "Query",
                //       posts: {
                //         __typename: "PaginatedPosts",
                //         hasMore: (fetchMoreResult as PostQuery).posts.hasMore,
                //         posts: [
                //           ...(prevValues as PostQuery).posts.posts
                //         ]
                //       },
                //     };
                //   }
                // },
              });
            }}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
