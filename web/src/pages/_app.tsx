import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Provider } from "urql";
import theme from "../theme";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: [],
            merge(existing: PaginatedPosts | undefined, incoming:PaginatedPosts ): PaginatedPosts{
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts]
              }
            }
          }
        }
      }
    }
  }),
  credentials: "include",
});

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;
