import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import { usePostsQuery } from "../generated/graphql";
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
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/updoot-section";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  if (!fetching && !data) {
    return <div>you got query failed for some reason</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>

      <br />
      {!data && fetching ? (
        <div>loading ...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shdaow="md" borderWidth="1px">
              <UpdootSection post={p}></UpdootSection>
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text> posted by {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
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
