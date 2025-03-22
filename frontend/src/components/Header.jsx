// src/components/Header.jsx
import React from 'react';
import { Box, Flex, Heading, Button, HStack, useColorMode, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Text } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          
          {isAuthenticated ? (
            <Menu>
              <MenuButton>
                <Avatar size="sm" name={user?.username} bg="blue.300" color="white" />
              </MenuButton>
              <MenuList color={colorMode === 'light' ? 'gray.800' : 'white'}>
                <Box px={3} py={2}>
                  <Text fontWeight="medium">{user?.username}</Text>
                </Box>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button 
              variant="outline" 
              colorScheme="whiteAlpha" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;