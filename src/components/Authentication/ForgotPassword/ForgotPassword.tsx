import { useState, ChangeEvent, FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth } from "../../../../firebase";

import { Flex, Text, Input, Button } from "@chakra-ui/react";
import "./forgotPassword.css";

type ForgotPasswordProps = {
  email: string;
};

const ForgotPassword = () => {
  // const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState<ForgotPasswordProps>({
    email: "",
  });

  // event handler for input change
  const handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // login handler function
  const handleSendResetEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setFormData({ email: "" });
      // setErrorMessage(
      //   `An email with instructions to reset your password has been sent to address "${formData.email}"`
      // );
      alert(
        `An email with instructions to reset your password has been sent to address "${formData.email}"`
      );
    } catch (error: any) {
      // handle specific Firebase Auth errors
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
            // setErrorMessage("Incorrect email/password.");
            alert("Incorrect email/password.");
            break;
          case "auth/too-many-requests":
            // setErrorMessage("Too many attempts. Please try again later");
            alert("Too many attempts. Please try again later.");
            break;
          default:
            // setErrorMessage(
            //   "Oops! Something went wrong. Please try again later."
            // );
            alert("Oops! Something went wrong. Please try again later.");
        }
      } else {
        // setErrorMessage("Oops! Something went wrong. Please try again late.r");
        alert("Oops! Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <Flex className="forgotPasswordContainer">
      <Text>Forgot password</Text>
      <form onSubmit={handleSendResetEmail} className="forgotPasswordForm">
        <Input
          type="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleEmailInputChange}
          required={true}
        />
        <Button type="submit">Send reset email</Button>
      </form>
    </Flex>
  );
};

export default ForgotPassword;
