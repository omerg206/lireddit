import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import { usePostsQuery } from "../generated/graphql";
import React from "react";
import { Layout } from "../components/layout";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>

      <br />
      {data ? (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>loading ...</div>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
