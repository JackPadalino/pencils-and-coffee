# Pencils & Coffee

A social network for educators.

- React
- TypeScript
- Chakra UI
- Firebase

Formatting conventions for React components in this project:

```
// third party imports (anything not made by us) always on top
import React from "react";

// any components made by us second
import { Example2 } from "../index";

// styling imports always last
import { Flex, Text } from "@chakra-ui/react"; // imports from Chakra component library
import "./example.css"; // every component should have dedicated css file, no matter how small!

const Example = () => {
  return (
    // the main container of a component should have the convention of '<component>Container'
    // no in-line styling ever! use the css file!
    <Flex className="exampleContainer">
      <Text>This is a parent component</Text>
      <Example2 />
    </Flex>
  );
};

export default Example;
```
