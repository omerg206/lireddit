import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import InputField from "../components/inputField";
import { Wrapper } from "../components/wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withApollo } from "../utils/with-apollo";

interface ForgotPassword {}

export const ForgotPassword: React.FC<{}> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values });
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

export default withApollo({ ssr: false })(ForgotPassword);
