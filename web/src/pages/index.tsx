import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import { usePostsQuery } from "../generated/graphql";
import React from "react";
import { Layout } from "../components/layout";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

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
        <Stack>
          {data!.posts.map((p) => (
            <Box key={p.id} p={5} shdaow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Flex my={8} m="auto" justifyContent="center">
          <Button isLoading={fetching}>load more</Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
