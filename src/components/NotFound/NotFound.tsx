import { Flex, Text } from "@chakra-ui/react";
import "./notfound.css";

// not found component - displayed when undefined route is hit by user
const NotFound = () => {
  return (
    <Flex className="notfoundContainer">
      <Text>This page not found.</Text>
    </Flex>
  );
};

export default NotFound;
