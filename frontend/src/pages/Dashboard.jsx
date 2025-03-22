// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Text,
  Button,
  Divider,
  Badge,
  useColorMode,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { dashboardAPI, handleApiError } from '../services/api';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colorMode } = useColorMode();
  
  // Colors for charts
  const chartColors = colorMode === 'light' 
    ? ['#3182CE', '#38B2AC', '#805AD5', '#DD6B20', '#D53F8C', '#718096']
    : ['#4299E1', '#4FD1C5', '#9F7AEA', '#F6AD55', '#ED64A6', '#A0AEC0'];
  
  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardAPI.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);
  
  // Prepare chart data for monthly expenses
  const getMonthlyChart = () => {
    if (!dashboardData || !dashboardData.expenses.monthly) {
      return null;
    }
    
    const monthlyData = dashboardData.expenses.monthly;
    const sortedMonths = Object.keys(monthlyData).sort();
    
    return {
      labels: sortedMonths.map(month => formatMonthLabel(month)),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: sortedMonths.map(month => monthlyData[month]),
          backgroundColor: chartColors[0],
          borderColor: colorMode === 'light' ? '#2C5282' : '#63B3ED',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for expenses by category
  const getCategoryChart = () => {
    if (!dashboardData || !dashboardData.expenses.by_category) {
      return null;
    }
    
    const categories = dashboardData.expenses.by_category;
    const categoryNames = Object.keys(categories);
    
    return {
      labels: categoryNames,
      datasets: [
        {
          data: categoryNames.map(category => categories[category]),
          backgroundColor: chartColors,
          borderColor: colorMode === 'light' ? '#FFFFFF' : '#2D3748',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Format month label from YYYY-MM to more readable format
  const formatMonthLabel = (monthStr) => {
    try {
      const [year, month] = monthStr.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy');
    } catch (e) {
      return monthStr;
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <Loading message="Loading your financial data..." />
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <Box textAlign="center" mt={10}>
          <Heading as="h2" size="lg" mb={4}>Error Loading Dashboard</Heading>
          <Text mb={4}>{error}</Text>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box p={4}>
        <Heading as="h1" size="xl" mb={6}>Financial Dashboard</Heading>
        
        {/* Key Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Stat 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
          >
            <StatLabel fontSize="lg">Total Expenses</StatLabel>
            <StatNumber fontSize="3xl">${dashboardData.expenses.total.toFixed(2)}</StatNumber>
            <StatHelpText>All recorded expenses</StatHelpText>
          </Stat>
          
          <Stat 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
          >
            <StatLabel fontSize="lg">Average Expense</StatLabel>
            <StatNumber fontSize="3xl">${dashboardData.expenses.average.toFixed(2)}</StatNumber>
            <StatHelpText>Per transaction</StatHelpText>
          </Stat>
          
          <Stat 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
          >
            <StatLabel fontSize="lg">Active Goals</StatLabel>
            <StatNumber fontSize="3xl">{dashboardData.goals.length}</StatNumber>
            <StatHelpText>Financial targets</StatHelpText>
          </Stat>
        </SimpleGrid>
        
        {/* Charts & Recent Data */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
          {/* Monthly Expenses Chart */}
          <Box 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            height={{ base: 'auto', md: '400px' }}
          >
            <Heading as="h3" size="md" mb={4}>Monthly Expenses</Heading>
            
            {getMonthlyChart() ? (
              <Box height="calc(100% - 50px)">
                <Bar
                  data={getMonthlyChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: colorMode === 'light' ? '#4A5568' : '#CBD5E0'
                        }
                      },
                      x: {
                        grid: {
                          color: colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: colorMode === 'light' ? '#4A5568' : '#CBD5E0'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: colorMode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                        callbacks: {
                          label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Flex justify="center" align="center" height="calc(100% - 50px)">
                <Text color="gray.500">No monthly data available</Text>
              </Flex>
            )}
          </Box>
          
          {/* Expenses by Category Chart */}
          <Box 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            height={{ base: 'auto', md: '400px' }}
          >
            <Heading as="h3" size="md" mb={4}>Expenses by Category</Heading>
            
            {getCategoryChart() ? (
              <Flex justify="center" align="center" height="calc(100% - 50px)">
                <Box width="80%" maxWidth="300px">
                  <Doughnut
                    data={getCategoryChart()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: colorMode === 'light' ? '#4A5568' : '#CBD5E0',
                            padding: 10,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: colorMode === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `$${value.toFixed(2)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Flex>
            ) : (
              <Flex justify="center" align="center" height="calc(100% - 50px)">
                <Text color="gray.500">No category data available</Text>
              </Flex>
            )}
          </Box>
        </SimpleGrid>
        
        {/* Recent Expenses & Goals */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Recent Expenses */}
          <Box 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h3" size="md">Recent Expenses</Heading>
              <Button 
                as={RouterLink} 
                to="/expenses" 
                size="sm" 
                colorScheme="blue"
              >
                View All
              </Button>
            </Flex>
            
            <Divider mb={4} />
            
            {dashboardData.expenses.recent.length > 0 ? (
              dashboardData.expenses.recent.map((expense) => (
                <Box key={expense.id} p={3} mb={2} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Flex align="center">
                        <Badge colorScheme="blue" mr={2}>{expense.category}</Badge>
                        <Text fontSize="sm" color="gray.500">{expense.expense_date}</Text>
                      </Flex>
                      {expense.description && (
                        <Text mt={1} fontSize="sm">{expense.description}</Text>
                      )}
                    </Box>
                    <Text fontWeight="bold" color="red.500">${expense.amount.toFixed(2)}</Text>
                  </Flex>
                </Box>
              ))
            ) : (
              <Text color="gray.500" textAlign="center">No expenses recorded yet</Text>
            )}
          </Box>
          
          {/* Goals Overview */}
          <Box 
            p={5} 
            shadow="md" 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
            borderRadius="lg"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h3" size="md">Financial Goals</Heading>
              <Button 
                as={RouterLink} 
                to="/goals" 
                size="sm" 
                colorScheme="green"
              >
                View All
              </Button>
            </Flex>
            
            <Divider mb={4} />
            
            {dashboardData.goals.length > 0 ? (
              dashboardData.goals.map((goal) => (
                <Box key={goal.id} p={3} mb={3} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold">{goal.name}</Text>
                    <Text fontSize="sm" color="gray.500">Due: {goal.target_date}</Text>
                  </Flex>
                  
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="sm">${goal.current_amount.toFixed(2)}</Text>
                    <Text fontSize="sm">${goal.target_amount.toFixed(2)}</Text>
                  </Flex>
                  
                  <Progress 
                    value={goal.progress} 
                    colorScheme="green" 
                    size="sm" 
                    borderRadius="full"
                  />
                  
                  <Flex justify="space-between" align="center" mt={1}>
                    <Text fontSize="xs">{Math.round(goal.progress)}% complete</Text>
                    <Button
                      as={RouterLink}
                      to={`/goals/${goal.id}/plan`}
                      size="xs"
                      colorScheme="blue"
                      variant="outline"
                    >
                      View Plan
                    </Button>
                  </Flex>
                </Box>
              ))
            ) : (
              <Box textAlign="center">
                <Text color="gray.500" mb={4}>No financial goals set yet</Text>
                <Button 
                  as={RouterLink} 
                  to="/goals" 
                  colorScheme="green" 
                  size="sm"
                >
                  Create Your First Goal
                </Button>
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Layout>
  );
};

export default Dashboard;