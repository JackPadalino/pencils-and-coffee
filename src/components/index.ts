// index for all app components
import App from "./App/App";
import Navbar from "./Navbar/Navbar";
import Home from "./Home/Home";
import NotFound from "./NotFound/NotFound";

// profile components
import Profile from "./Profile/Profile";
import EditProfileModal from "./Profile/EditProfileModal";

// authentication components
import {
  Login,
  Logout,
  ResetPassword,
  ForgotPassword,
  Register,
} from "./Authentication";

// example components
import Example from "./Example/Example";
import Example2 from "./Example/Example2";

export {
  Example,
  Example2,
  App,
  NotFound,
  Navbar,
  Home,
  Login,
  Logout,
  ForgotPassword,
  ResetPassword,
  Register,
  Profile,
  EditProfileModal,
};
