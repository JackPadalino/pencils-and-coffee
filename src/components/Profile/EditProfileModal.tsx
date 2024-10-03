import {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { doc, updateDoc } from "firebase/firestore";
import { IoCloseOutline } from "react-icons/io5";

import { db } from "../../../firebase";
import { UserProfile } from "../../Types";
import DeleteClassAlert from "./DeleteClassAlert";

import useMousePosition from "./useMousePosition";

import {
  Flex,
  Text,
  Select,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { IoMdAddCircleOutline } from "react-icons/io";
import "./editProfileModal.css";

type props = {
  userProfile: UserProfile;
  setUserProfile: Dispatch<SetStateAction<any | null>>;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  // modalSize: string;
};

const EditProfileModal = ({
  userProfile,
  setUserProfile,
  modalOpen,
  setModalOpen,
}: // modalSize,
props) => {
  // here we are creating a temporary state of of the user's profile. Instead of
  // creating a separate piece of state for each profile property, we create a single
  // piece of state, an object, that will hold the state of the entire form. By
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

  // variables for adding a new class
  const [showAddClassForm, setShowAddClassForm] = useState<boolean>(false);

  // finding mouse position
  const mousePosition = useMousePosition(); // Assuming this is a custom hook
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [mouseDistance, setMouseDistance] = useState<number>(0);

  const euclideanDistance = (point1: any, point2: any) => {
    const x1 = point1.x;
    const y1 = point1.y;
    const x2 = point2.x;
    const y2 = point2.y;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  useEffect(() => {
    if (buttonRef.current) {
      const { left, right, top, bottom } =
        buttonRef.current.getBoundingClientRect();
      const centerX = 0.5 * (right - left) + left;
      const centerY = 0.5 * (bottom - top) + top;
      setButtonPosition({ x: centerX, y: centerY });
    }
  }, [buttonRef.current]);

  useEffect(() => {
    const distance = euclideanDistance(mousePosition, buttonPosition);
    setMouseDistance(distance);
  }, [mousePosition.x, mousePosition.y]);

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

  const handleFormErrors = (field: string, message: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
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
    // updated the user information in firestore db
    await updateDoc(doc(db, "users", userProfile.id), {
      name: tempProfile.name,
      headline: tempProfile.headline,
      postalCode: tempProfile.postalCode,
      location: tempProfile.location,
      about: tempProfile.about,
      classes: tempProfile.classes,
    });
    // update the user information displayed on the profile page
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
        // size={modalSize}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form className="editProfileForm" onSubmit={saveProfileChanges}>
              <Flex className="editProfileInfoContainer">
                <Text className="formSectionTitle">Name</Text>
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
                <Text className="formSectionTitle">Headline</Text>
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
                <Text className="formSectionTitle">Location</Text>
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
                <Text className="formSectionTitle">About me</Text>
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
              <Flex className="editProfileInfoContainer myClassesContainer">
                <Flex className="myClassesTopContainer">
                  <Text className="formSectionTitle">My classes</Text>
                  <Flex
                    className="addClassContainer"
                    onClick={() => setShowAddClassForm(!showAddClassForm)}
                  >
                    <IoMdAddCircleOutline className="formSectionTitle" />
                    <Text>Add class</Text>
                  </Flex>
                </Flex>
                {showAddClassForm && (
                  <>
                    <form className="addNewClassForm">
                      <Text>New class name</Text>
                      <Select placeholder="Select">
                        <option value="option1">English</option>
                        <option value="option2">History</option>
                        <option value="option3">Social Studies</option>
                        <option value="option3">Science</option>
                        <option value="option3">Computer Science</option>
                      </Select>
                      <Text>Grade level</Text>
                      <NumberInput defaultValue={1} min={1} max={12}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Button className="addClassBtn">Add class</Button>
                    </form>
                  </>
                )}
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
              <Text>Button position</Text>
              <Text>{`${buttonPosition.x}, ${buttonPosition.y}`}</Text>
              <Text>Cursor position</Text>
              <Text>{`${mousePosition.x}, ${mousePosition.y}`}</Text>
              <Text>Cursor distance</Text>
              <Text>{mouseDistance}</Text>
              <Button
                type="submit"
                ref={buttonRef}
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
