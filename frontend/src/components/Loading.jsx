// src/components/Loading.jsx
import React from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <Flex justify="center" align="center" h="300px" w="100%">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text color="gray.500">{message}</Text>
      </VStack>
    </Flex>
  );
};

export default Loading;