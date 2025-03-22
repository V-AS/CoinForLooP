// src/components/Sidebar.jsx
import React from 'react';
import { Box, VStack, Icon, Tooltip, useColorMode, Text, Flex } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiDollarSign, FiTarget, FiBarChart2 } from 'react-icons/fi';

const SidebarItem = ({ icon, label, to, isActive }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Tooltip label={label} placement="right" hasArrow>
      <Link to={to} style={{ width: '100%' }}>
        <Flex
          alignItems="center"
          p={3}
          borderRadius="md"
          bg={isActive ? (colorMode === 'light' ? 'blue.50' : 'gray.700') : 'transparent'}
          color={isActive ? (colorMode === 'light' ? 'blue.500' : 'blue.200') : (colorMode === 'light' ? 'gray.700' : 'gray.400')}
          _hover={{
            bg: colorMode === 'light' ? 'blue.50' : 'gray.700',
            color: colorMode === 'light' ? 'blue.500' : 'blue.200'
          }}
          transition="all 0.2s"
        >
          <Icon as={icon} fontSize="18px" />
          <Text ml={2} display={{ base: 'none', md: 'block' }} fontWeight={isActive ? 'medium' : 'normal'}>
            {label}
          </Text>
        </Flex>
      </Link>
    </Tooltip>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { colorMode } = useColorMode();
  
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiDollarSign, label: 'Expenses', path: '/expenses' },
    { icon: FiTarget, label: 'Goals', path: '/goals' },
  ];
  
  return (
    <Box
      as="nav"
      height="calc(100vh - 60px)"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRight="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      w={{ base: '60px', md: '200px' }}
      py={4}
      position="sticky"
      top="60px"
    >
      <VStack spacing={2} align="stretch">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            to={item.path}
            isActive={
              item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path)
            }
          />
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;