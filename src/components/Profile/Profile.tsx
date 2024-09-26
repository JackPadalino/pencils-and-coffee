import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { auth, db } from "../../../firebase";
import LocationInput from "./LocationInput";

import {
  Flex,
  Text,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Textarea,
} from "@chakra-ui/react";
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
            <Flex className="profileUserInfoContainer">
              <Text>Name:</Text>
              <Input id="name" defaultValue={user.name} placeholder="Name" />
            </Flex>

            <Flex className="profileUserInfoContainer">
              <Text>Location:</Text>
              <LocationInput currentLocation={user.location} />
            </Flex>
            <Flex className="profileUserInfoContainer">
              <Text>About me:</Text>
              <Textarea
                id="about"
                defaultValue={user.about}
                placeholder="Bio"
              />
            </Flex>
            <Flex className="profileUserInfoContainer">
              <Text>My classes:</Text>
              <Flex className="profileMyClasses">
                {user.classes.map((eachClass: string, index: number) => (
                  <Text key={index} className="profileEachClass">
                    {eachClass}
                  </Text>
                ))}
              </Flex>
            </Flex>
          </form>
        </>
      )}
    </Flex>
  );
};

export default Profile;
