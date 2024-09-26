import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { auth, db } from "../../../firebase";
import LocationInput from "./LocationInput";

import { Flex, Text, Input } from "@chakra-ui/react";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  const calculateProfileCompletion = (userInfo: any) => {
    const userAttributes = ["name", "email", "classes", "location", "about"];
    const attributesCompleted = userAttributes.filter((attr) => {
      return Array.isArray(userInfo[attr])
        ? userInfo[attr].length > 0
        : !!userInfo[attr];
    });

    const percentComplete =
      (attributesCompleted.length / userAttributes.length) * 100;
    setProfileCompletion(percentComplete);
  };

  // checking for user locally -> need to add user object to recoil or redux store
  // when logging in and then pull down to this component later

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firestoreUser) => {
      if (firestoreUser) {
        console.log("a user signed in");
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", firestoreUser.email));
        await getDocs(q).then((querySnapshot) => {
          const userDoc = querySnapshot.docs[0];
          const userInfo = userDoc.data();
          calculateProfileCompletion(userInfo);
          setUser(userInfo);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Flex className="profileContainer">
      {user && (
        <>
          <Text
            className={
              profileCompletion < 100 ? "profileIncomplete" : "profileComplete"
            }
          >
            Profile: {profileCompletion}% complete
          </Text>
          <form className="profileUserInfoForm">
            <Flex>
              <Input id="name" defaultValue={user.name} placeholder="Name" />
            </Flex>
            <Flex>
              <Input id="email" defaultValue={user.email} placeholder="Email" />
            </Flex>
            <Flex>
              <LocationInput currentLocation={user.location} />
            </Flex>
            <Flex>
              <Input id="about" defaultValue={user.about} placeholder="Bio" />
            </Flex>
          </form>
        </>
      )}
    </Flex>
  );
};

export default Profile;
