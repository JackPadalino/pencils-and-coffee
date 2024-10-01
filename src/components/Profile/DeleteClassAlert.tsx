import { useRef } from "react";
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
};

const DeleteClassAlert = ({ deleteAlertOpen, setDeleteAlertOpen }: props) => {
  const cancelRef = useRef(null);
  return (
    <>
      <AlertDialog
        isOpen={deleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteAlertOpen(!deleteAlertOpen)}
        isCentered
        motionPreset="slideInRight"
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
              <Button
                colorScheme="red"
                onClick={() => setDeleteAlertOpen(!deleteAlertOpen)}
                ml={3}
              >
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
