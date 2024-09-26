import { Routes, Route } from "react-router-dom";
import {
  NotFound,
  Navbar,
  Home,
  Login,
  Logout,
  ForgotPassword,
  Register,
  ResetPassword,
  Profile,
} from "../index";

import { Flex } from "@chakra-ui/react";
import "./app.css";

const App = () => {
  return (
    <Flex className="appContainer">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Flex>
  );
};

export default App;
