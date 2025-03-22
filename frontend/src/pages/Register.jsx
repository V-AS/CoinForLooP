// src/pages/Register.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorMode
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormError('');
    clearError();
    
    // Validate inputs
    if (!username || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    const result = await register(username, password);
    
    if (result.success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <Layout>
      <Box 
        maxW="md" 
        mx="auto" 
        mt={10} 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="md"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
      >
        <Stack spacing={6}>
          <Heading as="h1" size="lg" textAlign="center">Create Account</Heading>
          
          {(formError || error) && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {formError || error}
            </Alert>
          )}
          
          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input 
                  type="text" 
                  value={username} 
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFormError('');
                    clearError();
                  }}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError('');
                      clearError();
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormError('');
                    clearError();
                  }}
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg" 
                mt={6}
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Create Account
              </Button>
            </Stack>
          </Box>
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Login
            </Link>
          </Text>
        </Stack>
      </Box>
    </Layout>
  );
};

export default Register;