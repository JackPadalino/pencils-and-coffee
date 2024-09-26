// third party imports (anything not made by us) always on top
// import React from "react";

// any components made by us second

// styling imports always last
import { Flex, Text } from "@chakra-ui/react"; // imports from Chakra component library
import "./example2.css"; // every component should have dedicated css file, no matter how small!

const Example2 = () => {
  return (
    // the main container of a component should have the convention of '<component>Container'
    // no in-line styling ever! use the css file!
    <Flex className="example2Container">
      <Text>This is a child component</Text>
    </Flex>
  );
};

export default Example2;
