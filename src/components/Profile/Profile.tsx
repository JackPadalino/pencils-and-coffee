import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { auth, db } from "../../../firebase";

import EditProfileModal from "./EditProfileModal";

import { Flex, Text } from "@chakra-ui/react";
import "./profile.css";

// user profile component - a user can view/edit their personal information
// here
const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
          setUser(docInfo);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Flex className="profileContainer">
      {user && (
        <>
          <Flex className="profileHeaderContainer">
            <Flex className="profileHeaderSubContainer">
              <Text>{user.name}</Text>
              <Text
                onClick={() => setModalOpen(!modalOpen)}
                className="profileEditBtn"
              >
                Edit
              </Text>
            </Flex>
            <Text>{user.headline}</Text>
            <Text>{user.location}</Text>
          </Flex>
          <Text>{user.about}</Text>
          <Flex className="profileMyClasses">
            {user.classes.map((eachClass: string, index: number) => (
              <Text key={index} className="profileEachClass">
                {eachClass}
              </Text>
            ))}
          </Flex>
          <EditProfileModal
            user={user}
            setUser={setUser}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
          />
        </>
      )}
    </Flex>
  );
};

export default Profile;
