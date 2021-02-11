import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import React, { useState } from "react";
import { Layout } from "../components/layout";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/updoot-section";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  const [{ data: loggedUser }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>you got query failed for some reason</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
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
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="delete icon"
                      isDisabled={loggedUser?.me?.id !== p.creator.id}
                      colorScheme="red"
                      onClick={() => {
                        deletePost({ id: p.id });
                      }}
                    ></IconButton>
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
            isLoading={fetching}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
