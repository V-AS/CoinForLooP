// src/components/Layout.jsx
import React from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      <Header />
      <Flex>
        <Sidebar />
        <Box flex="1" p={4} overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;