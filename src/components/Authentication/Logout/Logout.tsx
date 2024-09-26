import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";

// logout component - the user is redirected to this component
// when selecting 'logout' from the navbar, the user is then
// immediately logged out using useEffect and then redirected
// back to the login screen
const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return null;
};

export default Logout;
