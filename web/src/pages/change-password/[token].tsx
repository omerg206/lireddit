import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { NextRouter, useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/inputField";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/to-error-map";
import { Wrapper } from "../../components/wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/create-urql-cleint";
import NextLink from "next/link";

interface TokenProps {}

export const ChangePassword: NextPage = () => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const router: NextRouter = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token: typeof router.query.token === 'string' ? router.query.token : '',
            newPassword: values.newPassword,
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if (errorMap["newPassword"].includes("token")) {
              setTokenError(errorMap["newPassword"]);
            } else {
              setErrors(errorMap);
            }
          } else if (response.data?.changePassword.user) {
             setTokenError("");
             router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Flex>
                <Box mr={2} color="red" style={{ color: "red" }}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link> get a new one</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};



export default withUrqlClient(createUrqlClient)(ChangePassword);
