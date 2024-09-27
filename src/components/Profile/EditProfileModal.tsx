import { useState, useEffect } from "react";
import LocationInput from "./LocationInput";
import {
  Flex,
  Button,
  Text,
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
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  // calculating how much of a user's profile is complete based on number of
  // completed form inputs
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

  useEffect(() => {
    calculateProfileCompletion(user);
  }, []);

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
            <Text
              className={
                profileCompletion < 100
                  ? "editProfileIncomplete"
                  : "editProfileComplete"
              }
            >
              Profile: {profileCompletion}% complete
            </Text>
            <form className="editProfileForm">
              <Flex className="editProfileInfoContainer">
                <Text>Name:</Text>
                <Input id="name" defaultValue={user.name} placeholder="Name" />
              </Flex>

              <Flex className="editProfileInfoContainer">
                <Text>Location:</Text>
                <LocationInput currentLocation={user.location} />
              </Flex>
              <Flex className="editProfileInfoContainer">
                <Text>About me:</Text>
                <Textarea
                  id="about"
                  defaultValue={user.about}
                  placeholder="Bio"
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
            </form>
          </ModalBody>

          <ModalFooter>
            {/* <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
