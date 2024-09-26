import { useState, ChangeEvent, FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, setDoc, collection } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db, firebaseErrorHandler } from "../../../../firebase";

import { Flex, Text, Button, Input } from "@chakra-ui/react";
import "./register.css";

type Register = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// register component - new users sign up with this form
const Register = () => {
  const navigate = useNavigate();
  // const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState<Register>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // event handler for input change
  const handleRegisterInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // login handler function
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      // setErrorMessage("Passwords do not match");
      return;
    }

    try {
      // add user to Firebase Auth
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // add a new document with a generated id
      const newUserRef = doc(collection(db, "users"));
      const newUserData = {
        name: formData.name,
        email: formData.email,
        about: "",
        location: "",
        classes: [],
      };
      await setDoc(newUserRef, newUserData);
      navigate("/profile");
    } catch (error: any) {
      // handle specific Firebase Auth errors
      if (error instanceof FirebaseError) {
        const errorMessage = firebaseErrorHandler(error);
        alert(errorMessage);
      } else {
        // setErrorMessage("Oops! Something went wrong. Please try again later.");
        alert("Oops! Something went wrong. Please try again later.");
      }
    }
  };
  return (
    <Flex className="registerContainer">
      <Text>Register</Text>
      <form onSubmit={handleRegister} className="registerForm">
        <Input
          type="text"
          id="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleRegisterInputChange}
          required={true}
        />
        <Input
          type="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleRegisterInputChange}
          required={true}
        />
        <Input
          type="password"
          id="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleRegisterInputChange}
          required={true}
        />
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleRegisterInputChange}
          required={true}
        />
        <Button type="submit">Submit</Button>
      </form>
      {/* <p>{errorMessage}</p> */}
      <Text>
        Already have an account? <Link to="/login">Login here</Link>
      </Text>
    </Flex>
  );
};

export default Register;
