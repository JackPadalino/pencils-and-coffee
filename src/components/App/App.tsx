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

// here is the root component containing all the routes for the application
// each route has a path and a component to be rendered on that route
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
