import { Box, Heading } from "@chakra-ui/react";
import React from "react";
import { EditDeletePostButtons } from "../../components/edit-delete-post-buttons";
import { Layout } from "../../components/layout";
import { useGetPostFromUrl } from "../../utils/use-get-post-from-url";
import { withApollo } from "../../utils/with-apollo";

const Post: React.FC<{}> = ({}) => {
  const { data, loading, error } = useGetPostFromUrl();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Box mb={4}>{data?.post?.text}</Box>
      <EditDeletePostButtons
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  );
};

export default  withApollo({ssr: true})(Post);
