import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/is-server";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const { data, loading } = useMeQuery({ skip: isServer() });
  const [logout, { loading: logoutloading }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  let body = null;

  if (loading) {
  } else if (!data?.me) {
    //user not logged
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
  } else {
    //user  logged in
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button mr={4} as={Link}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}> {data.me.username} </Box>
        <Button
          variant="link"
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutloading}
        >
          {" "}
          logout{" "}
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={1}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box pa={4} ml={"auto"}>
          {body}
        </Box>
      </Flex>
    </Flex>
  );
};
