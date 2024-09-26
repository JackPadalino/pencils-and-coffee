import { useState } from "react";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

import "./navbar.css";

import { Flex } from "@chakra-ui/react";

const Navbar = () => {
  const [signedIn, setSignedIn] = useState<boolean>(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setSignedIn(true);
    } else {
      setSignedIn(false);
    }
  });

  return (
    <Flex className="navbarContainer">
      <Link to="/">Home</Link>
      {signedIn ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/logout">Logout</Link>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </Flex>
  );
};

export default Navbar;
