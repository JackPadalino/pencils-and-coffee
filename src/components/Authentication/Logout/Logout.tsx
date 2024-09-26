import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";

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
