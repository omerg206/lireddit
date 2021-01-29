import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Button,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { InputField } from "../components/inputField";
import { Wrapper } from "../wrapper";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ values, handleChange }) => (
          <Form>
            <InputField
              name="userName"
              placeHolder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeHolder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button mt={4} type="submit" colorScheme="teal">
              {" "}
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
