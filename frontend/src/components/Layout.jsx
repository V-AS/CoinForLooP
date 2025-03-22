// src/components/Layout.jsx
import React from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { colorMode } = useColorMode();
  
  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      <Header />
      
      {isAuthenticated ? (
        <Flex>
          <Sidebar />
          <Box flex="1" p={4} overflowY="auto">
            {children}
          </Box>
        </Flex>
      ) : (
        <Box>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default Layout;