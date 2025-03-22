// src/pages/Goals.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  SimpleGrid,
  Progress,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorMode,
  Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { goalAPI, handleApiError } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import GoalForm from '../components/GoalForm';
import { differenceInDays, differenceInMonths, format } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const { 
    isOpen: isAddOpen, 
    onOpen: onAddOpen, 
    onClose: onAddClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  
  // Fetch goals
  const fetchGoals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const goalsData = await goalAPI.getGoals();
      setGoals(goalsData);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchGoals();
  }, []);
  
  // Handle goal deletion
  const handleDelete = async () => {
    if (!selectedGoal) return;
    
    try {
      await goalAPI.deleteGoal(selectedGoal.id);
      
      toast({
        title: 'Goal deleted',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Refresh goals
      fetchGoals();
    } catch (err) {
      const errorData = handleApiError(err);
      toast({
        title: 'Error deleting goal',
        description: errorData.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      onDeleteClose();
      setSelectedGoal(null);
    }
  };
  
  // Calculate goal progress percentage
  const calculateProgress = (goal) => {
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  };
  
  // Format time remaining
  const getTimeRemaining = (goalDate) => {
    const today = new Date();
    const targetDate = new Date(goalDate);
    
    if (targetDate <= today) {
      return "Overdue";
    }
    
    const months = differenceInMonths(targetDate, today);
    const days = differenceInDays(targetDate, today) % 30;
    
    if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}${days > 0 ? `, ${days} ${days === 1 ? 'day' : 'days'}` : ''}`;
    } else {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };
  
  // Calculate monthly saving needed
  const getRequiredMonthlySaving = (goal) => {
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    
    if (targetDate <= today) {
      return goal.target_amount - goal.current_amount;
    }
    
    const months = Math.max(1, Math.ceil(differenceInDays(targetDate, today) / 30));
    const remaining = goal.target_amount - goal.current_amount;
    
    return remaining / months;
  };
  
  return (
    <Layout>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" size="xl">Financial Goals</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="green" 
            onClick={onAddOpen}
          >
            Add Goal
          </Button>
        </Flex>
        
        {/* Error display */}
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <Loading message="Loading goals..." />
        ) : (
          <>
            {/* Goals grid */}
            {goals.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {goals.map((goal) => {
                  const progress = calculateProgress(goal);
                  const timeRemaining = getTimeRemaining(goal.target_date);
                  const monthlySaving = getRequiredMonthlySaving(goal);
                  
                  return (
                    <Box 
                      key={goal.id} 
                      p={5} 
                      borderWidth="1px" 
                      borderRadius="lg" 
                      shadow="md"
                      bg={colorMode === 'light' ? 'white' : 'gray.700'}
                      position="relative"
                    >
                      <Flex position="absolute" top={2} right={2}>
                        <IconButton
                          aria-label="Edit goal"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedGoal(goal);
                            onEditOpen();
                          }}
                        />
                        <IconButton
                          aria-label="Delete goal"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setSelectedGoal(goal);
                            onDeleteOpen();
                          }}
                        />
                      </Flex>
                      
                      <Heading as="h3" size="md" mb={2} pr={16}>
                        {goal.name}
                      </Heading>
                      
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color="gray.500">Progress</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {Math.round(progress)}%
                        </Text>
                      </Flex>
                      
                      <Progress 
                        value={progress} 
                        colorScheme="green" 
                        size="sm" 
                        borderRadius="full" 
                        mb={4}
                      />
                      
                      <SimpleGrid columns={2} spacing={4} mb={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Current</Text>
                          <Text fontWeight="medium">${goal.current_amount.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Target</Text>
                          <Text fontWeight="medium">${goal.target_amount.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Target Date</Text>
                          <Text fontWeight="medium">{goal.target_date}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Time Left</Text>
                          <Text fontWeight="medium">{timeRemaining}</Text>
                        </Box>
                      </SimpleGrid>
                      
                      <Divider mb={4} />
                      
                      <Box mb={4}>
                        <Text fontSize="sm" color="gray.500">Required Monthly Saving</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                          ${monthlySaving.toFixed(2)}
                        </Text>
                      </Box>
                      
                      <Button 
                        colorScheme="blue" 
                        size="sm" 
                        width="full"
                        onClick={() => navigate(`/goals/${goal.id}/plan`)}
                      >
                        View AI Plan
                      </Button>
                    </Box>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Box 
                p={8} 
                textAlign="center" 
                borderWidth="1px" 
                borderRadius="lg"
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
              >
                <Text fontSize="lg" mb={4}>No financial goals found</Text>
                <Button onClick={onAddOpen} leftIcon={<AddIcon />} colorScheme="green">
                  Create Your First Goal
                </Button>
              </Box>
            )}
          </>
        )}
        
        {/* Add Goal Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Financial Goal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <GoalForm 
                onSuccess={() => {
                  onAddClose();
                  fetchGoals();
                }}
                onCancel={onAddClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* Edit Goal Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Goal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <GoalForm 
                initialData={selectedGoal}
                onSuccess={() => {
                  onEditClose();
                  fetchGoals();
                }}
                onCancel={onEditClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Goal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this goal?
              {selectedGoal && (
                <Box mt={4} p={3} borderWidth="1px" borderRadius="md">
                  <Text>
                    <strong>Name:</strong> {selectedGoal.name}
                  </Text>
                  <Text>
                    <strong>Target Amount:</strong> ${selectedGoal.target_amount.toFixed(2)}
                  </Text>
                  <Text>
                    <strong>Progress:</strong> ${selectedGoal.current_amount.toFixed(2)} (
                    {Math.round((selectedGoal.current_amount / selectedGoal.target_amount) * 100)}%)
                  </Text>
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
};

export default Goals;