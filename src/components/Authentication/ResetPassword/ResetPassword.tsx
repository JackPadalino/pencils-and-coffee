import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Flex, Text, Button, Input } from "@chakra-ui/react";

import "./resetPassword.css";

type ResetPasswordProps = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetPasswordProps>({
    password: "",
    confirmPassword: "",
  });
  const [oobCode, setOobCode] = useState<string | null>("");

  // event handler for input change
  const HandlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // login handler function
  const HandleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
    } else {
      try {
        const data = {
          oobCode: oobCode,
          newPassword: formData.password,
        };
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${
            import.meta.env.VITE_FIREBASE_API_KEY
          }`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        setFormData({
          password: "",
          confirmPassword: "",
        });
        alert("Your password has been reset. You may try logging in again.");
        navigate("/login");
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlOobCode = queryParams.get("oobCode");
    setOobCode(urlOobCode);
  }, []);

  return (
    <Flex className="resetPasswordContainer">
      <Text>Reset password</Text>
      <form onSubmit={HandleResetPassword} className="resetPasswordForm">
        <Input
          type="password"
          id="password"
          placeholder="Password"
          value={formData.password}
          onChange={HandlePasswordInputChange}
          required={true}
        />
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={HandlePasswordInputChange}
          required={true}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Flex>
  );
};

export default ResetPassword;
