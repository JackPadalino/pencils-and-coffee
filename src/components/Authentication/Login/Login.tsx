import {
  useState,
  ChangeEvent,
  FormEvent,
  // SyntheticEvent
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  // GoogleAuthProvider,
  // signInWithRedirect,
  signInWithPopup,
  // getRedirectResult,
  UserCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth, provider, firebaseErrorHandler } from "../../../../firebase";

import { Flex, Text, Input, Button } from "@chakra-ui/react";
import "./login.css";

type Login = {
  email: string;
  password: string;
};

const Login = () => {
  // const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // event handler for input change
  const handleLoginInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // login handler function
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      ).then(() => navigate("/"));
    } catch (error: any) {
      // handle specific Firebase Auth errors
      if (error instanceof FirebaseError) {
        const errorMessage = firebaseErrorHandler(error);
        alert(errorMessage);
      } else {
        // setErrorMessage("Oops! Something went wrong. Please try again late.r");
        alert("Oops! Something went wrong. Please try again later.");
      }
    }
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result: UserCredential | null) => {
        // this gives you a Google Access Token. You can use it to access the Google API.
        if (result) {
          // const credential = GoogleAuthProvider.credentialFromResult(result);
          // const token = credential?.accessToken;
          // const user = result.user;
          navigate("/");
        }
      })
      .catch((error: any) => {
        // handle specific Firebase Auth errors
        if (error instanceof FirebaseError) {
          const errorMessage = firebaseErrorHandler(error);
          alert(errorMessage);
        } else {
          // setErrorMessage("Oops! Something went wrong. Please try again later");
          alert("Oops! Something went wrong. Please try again later.");
        }
      });
  };

  return (
    <Flex className="loginContainer">
      <Text>Login</Text>
      <form onSubmit={handleLogin} className="loginForm">
        <Input
          type="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleLoginInputChange}
          required={true}
        />
        <Input
          type="password"
          id="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleLoginInputChange}
          required={true}
        />
        <Button type="submit">Submit</Button>
        <Button onClick={handleGoogleLogin}>Log in with Google</Button>
      </form>
      <Text>
        Forgot your password?{" "}
        <Link to="/forgotpassword">Click here to reset</Link>
      </Text>
      <Text>
        Dont have an account? <Link to="/register">Register now</Link>
      </Text>
    </Flex>
  );
};

export default Login;
