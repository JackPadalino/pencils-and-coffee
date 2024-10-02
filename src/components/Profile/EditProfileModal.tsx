import {
  useRef,
  useState,
  ChangeEvent,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
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
import { db } from "../../../firebase";
import DeleteClassAlert from "./DeleteClassAlert";
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
  userProfile: User;
  setUserProfile: Dispatch<SetStateAction<any | null>>;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  modalSize: string;
};

const EditProfileModal = ({
  userProfile,
  setUserProfile,
  modalOpen,
  setModalOpen,
  modalSize,
}: props) => {
  // here we are creating a temporary state of of the user's profile. By
  // creating a tempProfile we are able to edit a user's profile without
  // seeing the changes happen in the background behind the modal as the user
  // makes changes from within the modal
  const [tempProfile, setTempProfile] = useState({
    id: userProfile.id,
    name: userProfile.name,
    headline: userProfile.headline,
    postalCode: userProfile.postalCode,
    location: userProfile.location,
    about: userProfile.about,
    classes: userProfile.classes,
  });
  // a single piece of state to track all errors from inputs of the modal
  const [formErrors, setFormErrors] = useState({
    name: "",
    headline: "",
    postalCode: "",
    about: "",
  });
  // variables for deleting a class from user's profile
  const [deleteAlertOpen, setDeleteAlertOpen] = useState<boolean>(false);
  const deleteIndex = useRef<number>(0);

  const handleFormErrors = (field: string, message: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  // using the google maps places api to determine user's city from their zip code
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

  // handler for updating state of tempProfile -> first we are handling if the
  // user is editing the postal code. The postal code logic in the first part of this
  // handler is slightly more complex because we are displaying two different messages
  // based on the input of zip code: 1. if no message at all we display "This is a required
  // field" or 2. If the user has entered something into the input, but their zip code is
  // not valid according to the google maps place apis we display "There was a problem
  // finding your location"
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
            ...tempProfile,
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
          ...tempProfile,
          [id]: value,
        });
        handleFormErrors(id, "");
      }
    }
  };

  const handleDeleteClass = (index: number) => {
    setDeleteAlertOpen(!deleteAlertOpen);
    deleteIndex.current = index;
  };

  // update user information in firestore db
  const saveProfileChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.values(formErrors).some((error) => error)) return;
    await updateDoc(doc(db, "users", userProfile.id), {
      name: tempProfile.name,
      headline: tempProfile.headline,
      postalCode: tempProfile.postalCode,
      location: tempProfile.location,
      about: tempProfile.about,
      classes: tempProfile.classes,
    });
    setUserProfile({
      ...userProfile,
      name: tempProfile.name,
      headline: tempProfile.headline,
      postalCode: tempProfile.postalCode,
      location: tempProfile.location,
      about: tempProfile.about,
      classes: tempProfile.classes,
    });
    setModalOpen(!modalOpen);
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(!modalOpen)}
        size={modalSize}
        isCentered
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
                  defaultValue={tempProfile.name}
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
                  defaultValue={tempProfile.headline}
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
                <Text>Location</Text>
                <Input
                  id="postalCode"
                  type="number"
                  defaultValue={tempProfile.postalCode}
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
                  defaultValue={tempProfile.about}
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
                  {tempProfile.classes.map((eachClass: any, index: number) => (
                    <Flex key={index} className="editProfileEachClass">
                      <Flex className="eachClassTop">
                        <Text>{eachClass.subject}</Text>
                        <IoCloseOutline
                          className="editProfileDeleteClass"
                          onClick={() => handleDeleteClass(index)}
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
        {/* delete class dialog box */}
        <DeleteClassAlert
          deleteAlertOpen={deleteAlertOpen}
          setDeleteAlertOpen={setDeleteAlertOpen}
          deleteIndex={deleteIndex.current}
          tempProfile={tempProfile}
          setTempProfile={setTempProfile}
        />
      </Modal>
    </>
  );
};

export default EditProfileModal;
