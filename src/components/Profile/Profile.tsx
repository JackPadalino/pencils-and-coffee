import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { auth, db } from "../../../firebase";

import EditProfileModal from "./EditProfileModal";

import { Flex, Text } from "@chakra-ui/react";
import "./profile.css";

// type User = {
//   id: string;
//   name: string;
//   headline: string;
//   postalCode: string;
//   location: string;
//   about: string;
//   classes: { grade: number; subject: string }[];
// };

// user profile component - a user can view/edit their personal information
// here
const Profile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSize, setModalSize] = useState<string>("");

  // check for mobile view to determine edit profile modal size
  // maybe send state up to redux store to be used by other components
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1280px)");
    const handleResize = () => {
      setModalSize(mediaQuery.matches ? "full" : "xl");
    };
    mediaQuery.addEventListener("change", handleResize);
    handleResize(); // initial call
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // checking for user locally -> need to add user object to recoil or redux store
  // when logging in and then pull down to this component later
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firestoreUser) => {
      if (firestoreUser) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", firestoreUser.email));
        await getDocs(q).then((querySnapshot) => {
          const doc = querySnapshot.docs[0];
          const docInfo = { id: doc.id, ...doc.data() };
          setUserProfile(docInfo);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Flex className="profileContainer">
      {userProfile && (
        <>
          <Flex className="profileHeaderContainer">
            <Flex className="profileHeaderSubContainer">
              <Text>{userProfile.name}</Text>
              <Text
                onClick={() => setModalOpen(!modalOpen)}
                className="profileEditBtn"
              >
                Edit
              </Text>
            </Flex>
            <Text>{userProfile.headline}</Text>
            <Text>{userProfile.location}</Text>
          </Flex>
          <Text>{userProfile.about}</Text>
          <Flex className="profileMyClasses">
            {userProfile.classes.map((eachClass: any, index: number) => (
              <Flex key={index} className="profileEachClass">
                <Text>{eachClass.subject}</Text>
                <Text fontSize="xs">Grade: {eachClass.grade}</Text>
              </Flex>
            ))}
          </Flex>
          <EditProfileModal
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            modalSize={modalSize}
          />
        </>
      )}
    </Flex>
  );
};

export default Profile;
