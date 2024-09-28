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
  const [formErrors, setFormErrors] = useState({
    name: "",
    headline: "",
    postalCode: "",
    about: "",
  });

  const handleFormErrors = (field: string, message: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

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

  const getUserLocation = async (postalCode: string) => {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${
        import.meta.env.VITE_GOOGLE_PLACES_API_KEY
      }`;

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

  const handleUserInputChange = async (e: ChangeEvent<any>) => {
    const { id, value } = e.target;
    // check if postalCode first
    if (id === "postalCode") {
      if (!value) {
        handleFormErrors("postalCode", "This is a required field.");
      } else {
        const location = await getUserLocation(value);
        if (location) {
          setUserProfile({
            ...userProfile,
            location: location,
            [id]: value,
          });
          handleFormErrors("postalCode", "");
        } else {
          handleFormErrors(
            "postalCode",
            "Oops! There was a problem finding your location."
          );
        }
      }
    } else {
      // validate other fields and set errors
      if (!value) {
        handleFormErrors(id, "This is a required field.");
      } else {
        setUserProfile({
          ...userProfile,
          [id]: value,
        });
        handleFormErrors(id, "");
      }
    }
  };

  // update user information in firestore db
  const saveProfileChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.values(formErrors).some((error) => error)) return;
    await updateDoc(doc(db, "users", userProfile.id), {
      name: userProfile.name,
      headline: userProfile.headline,
      postalCode: userProfile.postalCode,
      location: userProfile.location,
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
                <Text>Name</Text>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user.name}
                  onChange={handleUserInputChange}
                />
                {formErrors.name && (
                  <Text fontSize="sm" color="red">
                    {formErrors.name}
                  </Text>
                )}
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>Headline</Text>
                <Input
                  id="headline"
                  type="text"
                  defaultValue={user.headline}
                  onChange={handleUserInputChange}
                />
                {formErrors.headline && (
                  <Text fontSize="sm" color="red">
                    {formErrors.headline}
                  </Text>
                )}
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>Postal code</Text>
                <Input
                  id="postalCode"
                  type="number"
                  defaultValue={user.postalCode}
                  onChange={handleUserInputChange}
                />
                {formErrors.postalCode && (
                  <Text fontSize="sm" color="red">
                    {formErrors.postalCode}
                  </Text>
                )}
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>About me</Text>
                <Textarea
                  id="about"
                  defaultValue={user.about}
                  onChange={handleUserInputChange}
                />
                {formErrors.about && (
                  <Text fontSize="sm" color="red">
                    {formErrors.about}
                  </Text>
                )}
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>My classes</Text>
                <Flex className="editProfileMyClasses">
                  {user.classes.map((eachClass: string, index: number) => (
                    <Text key={index} className="editProfileEachClass">
                      {eachClass}
                    </Text>
                  ))}
                </Flex>
              </Flex>
              <Button
                type="submit"
                isDisabled={Object.values(formErrors).some((error) => error)}
              >
                Save changes
              </Button>
            </form>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
