import { useRef, Dispatch, SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  //   AlertDialogCloseButton,
  Button,
} from "@chakra-ui/react";
import "./deleteclassalert.css";

type props = {
  deleteAlertOpen: boolean;
  setDeleteAlertOpen: (deleteAlertOpen: boolean) => void;
  deleteIndex: number;
  tempProfile: any;
  setTempProfile: Dispatch<SetStateAction<any | null>>;
};

const DeleteClassAlert = ({
  deleteAlertOpen,
  setDeleteAlertOpen,
  deleteIndex,
  tempProfile,
  setTempProfile,
}: props) => {
  const cancelRef = useRef(null);

  const handleDeleteClass = () => {
    if (deleteIndex >= 0 && deleteIndex < tempProfile.classes.length) {
      tempProfile.classes.splice(deleteIndex, 1);
      setTempProfile({ ...tempProfile, classes: tempProfile.classes });
    }
    setDeleteAlertOpen(!deleteAlertOpen);
  };

  return (
    <>
      <AlertDialog
        isOpen={deleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteAlertOpen(!deleteAlertOpen)}
        isCentered
        motionPreset="slideInRight"
        size="xs"
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete class
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setDeleteAlertOpen(!deleteAlertOpen)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteClass} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteClassAlert;
