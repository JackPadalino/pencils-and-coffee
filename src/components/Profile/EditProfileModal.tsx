import {
  useState,
  ChangeEvent,
  FormEvent,
  Dispatch,
  SetStateAction,
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
import { IoCloseOutline } from "react-icons/io5";

import "./editProfileModal.css";

type User = {
  id: string;
  name: string;
  headline: string;
  postalCode: string;
  location: string;
  about: string;
  classes: { grade: number; subject: string }[];
};

type props = {
  user: User;
  setUser: Dispatch<SetStateAction<any | null>>;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  modalSize: string;
};

const EditProfileModal = ({
  user,
  setUser,
  modalOpen,
  setModalOpen,
  modalSize,
}: props) => {
  const [tempProfile, setTempProfile] = useState({
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
          setTempProfile({
            ...user,
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
        setTempProfile({
          ...user,
          [id]: value,
        });
        handleFormErrors(id, "");
      }
    }
  };

  const handleDeleteClass = () => {
    console.log("Class deleted!");
  };

  // update user information in firestore db
  const saveProfileChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.values(formErrors).some((error) => error)) return;
    await updateDoc(doc(db, "users", user.id), {
      name: tempProfile.name,
      headline: tempProfile.headline,
      postalCode: tempProfile.postalCode,
      location: tempProfile.location,
      about: tempProfile.about,
    });
    setUser({
      ...user,
      name: tempProfile.name,
      headline: tempProfile.headline,
      postalCode: tempProfile.postalCode,
      location: tempProfile.location,
      about: tempProfile.about,
    });
    setModalOpen(!modalOpen);
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(!modalOpen)}
        size={modalSize}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  placeholder="For example: Art and Music Teacher"
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
                  placeholder="Enter a 5 digit postal code"
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
                  placeholder="Describe the classes you teach, your student demographics, what kind of team your're looking for, etc. The more details you include the more likely you are to find your dream team!"
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
                  {user.classes.map((eachClass: any, index: number) => (
                    <Flex key={index} className="editProfileEachClass">
                      <Flex className="eachClassTop">
                        <Text>{eachClass.subject}</Text>
                        <IoCloseOutline
                          className="editProfileDeleteClass"
                          onClick={handleDeleteClass}
                        />
                      </Flex>

                      <Text fontSize="xs">Grade: {eachClass.grade}</Text>
                    </Flex>
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
