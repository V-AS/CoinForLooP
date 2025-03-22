// src/components/Header.jsx
import React from 'react';
import { Box, Flex, Heading, HStack, useColorMode, IconButton } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <Box as="header" bg={colorMode === 'light' ? 'blue.500' : 'gray.800'} color="white" px={4} py={3} position="sticky" top="0" zIndex="sticky">
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <Heading 
          as="h1" 
          size="md" 
          cursor="pointer" 
          onClick={() => navigate('/')}
        >
          AI Financial Planner
        </Heading>
        
        <HStack spacing={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: colorMode === 'light' ? 'blue.600' : 'gray.700' }}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;