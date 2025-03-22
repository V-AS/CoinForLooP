// src/pages/Expenses.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorMode
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { expenseAPI, handleApiError } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ExpenseForm from '../components/ExpenseForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: null,
    endDate: null
  });
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();
  const { colorMode } = useColorMode();
  
  // Fetch expenses and categories
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare filter parameters
      const filterParams = {};
      if (filters.category) filterParams.category = filters.category;
      if (filters.startDate) filterParams.startDate = format(filters.startDate, 'yyyy-MM-dd');
      if (filters.endDate) filterParams.endDate = format(filters.endDate, 'yyyy-MM-dd');
      
      const [expensesData, categoriesData] = await Promise.all([
        expenseAPI.getExpenses(filterParams),
        expenseAPI.getCategories()
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);
  
  // Reload data when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: null,
      endDate: null
    });
  };
  
  // Handle expense deletion
  const handleDelete = async () => {
    if (!selectedExpense) return;
    
    try {
      await expenseAPI.deleteExpense(selectedExpense.id);
      
      toast({
        title: 'Expense deleted',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Refresh expenses
      fetchData();
    } catch (err) {
      const errorData = handleApiError(err);
      toast({
        title: 'Error deleting expense',
        description: errorData.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      onDeleteClose();
      setSelectedExpense(null);
    }
  };
  
  // Calculate total filtered expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return (
    <Layout>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" size="xl">Expenses</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={onAddOpen}
          >
            Add Expense
          </Button>
        </Flex>
        
        {/* Filters */}
        <Box 
          mb={6} 
          p={4} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={colorMode === 'light' ? 'white' : 'gray.700'}
        >
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'stretch', md: 'center' }} 
            justify="space-between" 
            wrap="wrap" 
            gap={4}
          >
            <HStack spacing={4} flex="1">
              <Box>
                <Text fontSize="sm" mb={1}>Category</Text>
                <Select 
                  value={filters.category} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  placeholder="All Categories"
                  size="sm"
                  w="150px"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="sm" mb={1}>From Date</Text>
                <Box borderWidth="1px" borderRadius="md" p={1} bg={colorMode === 'light' ? 'white' : 'gray.700'}>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    placeholderText="Start Date"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    selectsStart
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                  />
                </Box>
              </Box>
              
              <Box>
                <Text fontSize="sm" mb={1}>To Date</Text>
                <Box borderWidth="1px" borderRadius="md" p={1} bg={colorMode === 'light' ? 'white' : 'gray.700'}>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    placeholderText="End Date"
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    selectsEnd
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    minDate={filters.startDate}
                  />
                </Box>
              </Box>
            </HStack>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Flex>
        </Box>
        
        {/* Error display */}
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <Loading message="Loading expenses..." />
        ) : (
          <>
            {/* Summary */}
            {expenses.length > 0 && (
              <Box 
                mb={6} 
                p={4} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
              >
                <Flex justify="space-between" align="center">
                  <Text>
                    Showing <strong>{expenses.length}</strong> {expenses.length === 1 ? 'expense' : 'expenses'}
                    {filters.category && ` in category "${filters.category}"`}
                  </Text>
                  <Text fontWeight="bold">
                    Total: ${totalExpenses.toFixed(2)}
                  </Text>
                </Flex>
              </Box>
            )}
            
            {/* Expenses table */}
            {expenses.length > 0 ? (
              <Box 
                overflow="auto" 
                borderWidth="1px" 
                borderRadius="lg" 
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
              >
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Category</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {expenses.map((expense) => (
                      <Tr key={expense.id}>
                        <Td>{expense.expense_date}</Td>
                        <Td>
                          <Badge colorScheme="blue">{expense.category}</Badge>
                        </Td>
                        <Td>{expense.description || '-'}</Td>
                        <Td isNumeric fontWeight="medium" color="red.500">
                          ${expense.amount.toFixed(2)}
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete expense"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setSelectedExpense(expense);
                              onDeleteOpen();
                            }}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box 
                p={8} 
                textAlign="center" 
                borderWidth="1px" 
                borderRadius="lg" 
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
              >
                <Text fontSize="lg" mb={4}>No expenses found</Text>
                {Object.values(filters).some(v => v) ? (
                  <Button onClick={clearFilters} size="sm" colorScheme="blue">
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={onAddOpen} leftIcon={<AddIcon />} colorScheme="blue">
                    Add Your First Expense
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
        
        {/* Add Expense Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Expense</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ExpenseForm 
                onSuccess={() => {
                  onAddClose();
                  fetchData();
                }}
                onCancel={onAddClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Expense</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this expense?
              {selectedExpense && (
                <Box mt={4} p={3} borderWidth="1px" borderRadius="md">
                  <Text>
                    <strong>Category:</strong> {selectedExpense.category}
                  </Text>
                  <Text>
                    <strong>Amount:</strong> ${selectedExpense.amount.toFixed(2)}
                  </Text>
                  <Text>
                    <strong>Date:</strong> {selectedExpense.expense_date}
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

export default Expenses;