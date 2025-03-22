// src/pages/GoalPlanner.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  List,
  ListItem,
  ListIcon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CheckCircleIcon, RepeatIcon } from '@chakra-ui/icons';
import { goalAPI, handleApiError } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { differenceInDays, differenceInMonths, format } from 'date-fns';

const GoalPlanner = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  
  const [goal, setGoal] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch goal and plan data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch goal details
        const goalData = await goalAPI.getGoal(goalId);
        setGoal(goalData);
        
        // Try to fetch existing plan
        try {
          const planData = await goalAPI.getGoalPlan(goalId);
          setPlan(planData);
        } catch (planError) {
          // It's okay if there's no plan yet
          console.log('No AI plan found for this goal');
          setPlan(null);
        }
      } catch (err) {
        const errorData = handleApiError(err);
        setError(errorData.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (goalId) {
      fetchData();
    }
  }, [goalId]);
  
  // Generate a new AI plan
  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const planData = await goalAPI.generateGoalPlan(goalId);
      setPlan(planData);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper functions
  const calculateProgress = (goal) => {
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  };
  
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
  
  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <Loading message="Loading goal details..." />
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <Box p={4}>
          <Button 
            leftIcon={<ChevronLeftIcon />} 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            mb={6}
          >
            Back to Goals
          </Button>
          
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        </Box>
      </Layout>
    );
  }
  
  // Goal not found
  if (!goal) {
    return (
      <Layout>
        <Box p={4}>
          <Button 
            leftIcon={<ChevronLeftIcon />} 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            mb={6}
          >
            Back to Goals
          </Button>
          
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Goal not found</AlertTitle>
          </Alert>
        </Box>
      </Layout>
    );
  }
  
  // Main content
  const progress = calculateProgress(goal);
  const timeRemaining = getTimeRemaining(goal.target_date);
  
  return (
    <Layout>
      <Box p={4}>
        <Flex align="center" mb={6}>
          <Button 
            leftIcon={<ChevronLeftIcon />} 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            mr={4}
          >
            Back
          </Button>
          <Heading as="h1" size="xl">{goal.name} Plan</Heading>
        </Flex>
        
        {/* Goal details */}
        <Box 
          p={5} 
          mb={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={colorMode === 'light' ? 'white' : 'gray.700'}
          shadow="md"
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={3}>Goal Progress</Text>
              
              <Flex justify="space-between" mb={1}>
                <Text>${goal.current_amount.toFixed(2)}</Text>
                <Text>${goal.target_amount.toFixed(2)}</Text>
              </Flex>
              
              <Progress 
                value={progress} 
                colorScheme="green" 
                size="lg" 
                borderRadius="full" 
                mb={2}
              />
              
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.500">Current</Text>
                <Text fontSize="sm" color="gray.500">Target</Text>
              </Flex>
              
              <Text mt={4} fontSize="md">
                <Badge colorScheme="green" fontSize="0.9em" mr={2}>
                  {Math.round(progress)}% Complete
                </Badge>
                ${(goal.target_amount - goal.current_amount).toFixed(2)} remaining
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <Stat>
                <StatLabel>Target Date</StatLabel>
                <StatNumber fontSize="xl">{goal.target_date}</StatNumber>
                <StatHelpText>{timeRemaining} remaining</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Monthly Need</StatLabel>
                <StatNumber fontSize="xl" color="blue.500">
                  ${((goal.target_amount - goal.current_amount) / Math.max(1, Math.ceil(differenceInDays(new Date(goal.target_date), new Date()) / 30))).toFixed(2)}
                </StatNumber>
                <StatHelpText>per month to reach goal</StatHelpText>
              </Stat>
            </SimpleGrid>
          </SimpleGrid>
        </Box>
        
        {/* AI Plan section */}
        {isGenerating ? (
          <Box 
            p={8} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={4}>Generating Your AI Savings Plan</Heading>
            <Text mb={6}>
              Our AI is analyzing your financial data and creating a personalized savings plan...
            </Text>
            <Loading />
          </Box>
        ) : !plan ? (
          <Box 
            p={8} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={4}>No AI Plan Generated Yet</Heading>
            <Text mb={6}>
              Generate an AI-powered savings plan based on your spending habits and goal details.
              The AI will analyze your financial patterns and suggest a realistic plan to reach your goal.
            </Text>
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={generatePlan}
              isLoading={isGenerating}
              loadingText="Analyzing your finances..."
            >
              Generate AI Savings Plan
            </Button>
          </Box>
        ) : (
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            shadow="md"
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h3" size="lg">Your AI Savings Plan</Heading>
              <Flex>
                <Badge colorScheme="blue" p={2} borderRadius="md" fontSize="md">
                  AI Generated
                </Badge>
                <IconButton
                  aria-label="Regenerate plan"
                  icon={<RepeatIcon />}
                  ml={2}
                  onClick={generatePlan}
                  isLoading={isGenerating}
                />
              </Flex>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <Box 
                p={4}
                bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
                borderRadius="md"
              >
                <Text fontSize="md" fontWeight="medium" mb={2}>Recommended Monthly Saving</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  ${plan.monthly_saving.toFixed(2)}
                </Text>
                <Text fontSize="sm" mt={2}>
                  This is {plan.monthly_saving > ((goal.target_amount - goal.current_amount) / Math.max(1, Math.ceil(differenceInDays(new Date(goal.target_date), new Date()) / 30))) ? 'more than' : 'less than'} the minimum required to reach your goal on time.
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>Key Recommendations</Text>
                <List spacing={2}>
                  {plan.recommendations.slice(0, 3).map((rec, index) => (
                    <ListItem key={index} display="flex">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Text>{rec}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </SimpleGrid>
            
            <Divider mb={6} />
            
            <Box mb={6}>
              <Text fontSize="md" fontWeight="medium" mb={3}>AI Analysis & Plan</Text>
              <Text whiteSpace="pre-line">{plan.plan_text}</Text>
            </Box>
            
            {plan.recommendations.length > 3 && (
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>Additional Recommendations</Text>
                <List spacing={2}>
                  {plan.recommendations.slice(3).map((rec, index) => (
                    <ListItem key={index} display="flex">
                      <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                      <Text>{rec}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <Divider my={6} />
            
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="gray.500">
                Plan generated: {plan.created_at}
              </Text>
              <Button 
                colorScheme="blue" 
                onClick={generatePlan}
                leftIcon={<RepeatIcon />}
                isLoading={isGenerating}
                loadingText="Regenerating..."
              >
                Regenerate Plan
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default GoalPlanner;