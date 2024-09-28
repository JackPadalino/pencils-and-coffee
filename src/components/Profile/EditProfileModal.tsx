import {
  useState,
  // useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  Flex,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
} from "@chakra-ui/react";

import "./editProfileModal.css";

type props = {
  user: any;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
};

const EditProfileModal = ({ user, modalOpen, setModalOpen }: props) => {
  // const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [userProfile, setUserProfile] = useState({
    id: user.id,
    name: user.name,
    headline: user.headline,
    postalCode: user.postalCode,
    location: user.location,
    about: user.about,
  });
  const [locationError, setLocationError] = useState<string>("");

  // // calculating how much of a user's profile is complete based on number of
  // // completed form inputs
  // const calculateProfileCompletion = (userInfo: any) => {
  //   const userAttributes = ["name", "email", "classes", "location", "about"];
  //   const attributesCompleted = userAttributes.filter((attr) => {
  //     return Array.isArray(userInfo[attr])
  //       ? userInfo[attr].length > 0
  //       : !!userInfo[attr];
  //   });
  //   const percentComplete =
  //     (attributesCompleted.length / userAttributes.length) * 100;
  //   setProfileCompletion(percentComplete);
  // };

  // useEffect(() => {
  //   calculateProfileCompletion(user);
  // }, []);

  const getUserLocation = async () => {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${
        userProfile.postalCode
      }&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === "OK") {
        const city = data.results[0].address_components.find((component: any) =>
          component.types.includes("locality")
        );
        const state = data.results[0].address_components.find(
          (component: any) =>
            component.types.includes("administrative_area_level_1")
        );

        const location = `${city.long_name}, ${state.short_name}`;
        return location;
      } else {
        console.error("Geocoding error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Error validating city:", error);
      return null;
    }
  };

  const handleUserInputChange = (e: ChangeEvent<any>) => {
    const { id, value } = e.target;
    // verify location

    setUserProfile({
      ...userProfile,
      [id]: value,
    });
  };

  const saveProfileChanges = async (e: FormEvent) => {
    e.preventDefault();
    // verify location before saving changes and closing modal
    const location = await getUserLocation();
    if (!location) {
      setLocationError("Oops! There was a problem finding your location.");
      return;
    } else {
      setUserProfile({
        ...userProfile,
        location: location,
      });
      setLocationError("");
    }
    // update user information in firestore db
    await updateDoc(doc(db, "users", userProfile.id), {
      name: userProfile.name,
      headline: userProfile.headline,
      location: location,
      about: userProfile.about,
    });
    setModalOpen(!modalOpen);
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(!modalOpen)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Text
              className={
                profileCompletion < 100
                  ? "editProfileIncomplete"
                  : "editProfileComplete"
              }
            >
              Profile: {profileCompletion}% complete
            </Text> */}
            <form className="editProfileForm" onSubmit={saveProfileChanges}>
              <Flex className="editProfileInfoContainer">
                <Text>Name:</Text>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user.name}
                  placeholder="Name"
                  required={true}
                  onChange={handleUserInputChange}
                />
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>Headline:</Text>
                <Input
                  id="headline"
                  type="text"
                  defaultValue={user.headline}
                  placeholder="Headline"
                  required={true}
                  onChange={handleUserInputChange}
                />
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>Postal code:</Text>
                <Input
                  id="postalCode"
                  type="number"
                  defaultValue={user.postalCode}
                  placeholder="Postal code"
                  required={true}
                  onChange={handleUserInputChange}
                />
                {locationError && (
                  <Text fontSize="sm" color={"red"}>
                    {locationError}
                  </Text>
                )}
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>About me:</Text>
                <Textarea
                  id="about"
                  defaultValue={user.about}
                  placeholder="About me"
                  required={true}
                  onChange={handleUserInputChange}
                />
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>My classes:</Text>
                <Flex className="editProfileMyClasses">
                  {user.classes.map((eachClass: string, index: number) => (
                    <Text key={index} className="editProfileEachClass">
                      {eachClass}
                    </Text>
                  ))}
                </Flex>
              </Flex>
              <Button type="submit">Save changes</Button>
            </form>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
