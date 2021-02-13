import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "uppdoot-loading" | "downpdoot-loading" | "not-loading"
  >("not-loading");
  const [vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="updoot post"
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "uppdoot-loading"}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }

          setLoadingState("uppdoot-loading");
          await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
          });
          setLoadingState("not-loading");
        }}
      ></IconButton>
      {post.points}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downdoot post"
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downpdoot-loading"}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downpdoot-loading");
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
          });
          setLoadingState("not-loading");
        }}
      ></IconButton>
    </Flex>
  );
};
