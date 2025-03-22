// src/pages/Login.jsx
import React from 'react';
import {
  Box,
  Button,
  Stack,
  Heading,
  Text,
  Image,
  Flex,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const handleStart = () => {
    // Simply navigate to dashboard without authentication
    navigate('/');
  };

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="100vh"
      bg={colorMode === 'light' ? 'blue.50' : 'gray.800'}
    >
      <Box 
        maxW="md" 
        w="full"
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        textAlign="center"
      >
        <Stack spacing={8}>
          <Heading as="h1" size="xl">CoinFlow</Heading>
          <Text fontSize="lg">
            Your AI-powered financial assistant to track expenses and plan for your goals.
          </Text>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={handleStart}
          >
            Get Started
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};

export default Login;