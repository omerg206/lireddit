import { Box, Flex, Link, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/dist/next-server/lib/router/router";
import React, { useState } from "react";
import InputField from "../components/inputField";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/create-urql-cleint";
import { toErrorMap } from "../utils/to-error-map";
import { Wrapper } from "../components/wrapper";
import login from "./login";

interface ForgotPassword {}

export const ForgotPassword: React.FC<{}> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword({variables: values});
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box> if an account exits, an email was sent </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="email"
                type="email"
              />

              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(ForgotPassword);
