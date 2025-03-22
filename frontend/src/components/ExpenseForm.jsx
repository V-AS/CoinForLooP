// src/components/ExpenseForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Stack,
  NumberInput,
  NumberInputField,
  useToast,
  FormErrorMessage
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { expenseAPI, handleApiError } from '../services/api';
import { format } from 'date-fns';

const ExpenseForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expense_date: new Date()
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await expenseAPI.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error fetching categories',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      expense_date: date
    }));
    
    // Clear error when field is edited
    if (errors.expense_date) {
      setErrors(prev => ({ ...prev, expense_date: null }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.expense_date) {
      newErrors.expense_date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the date to ISO string (YYYY-MM-DD)
      const formattedDate = format(formData.expense_date, 'yyyy-MM-dd');
      
      // Send data to API
      await expenseAPI.addExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        expense_date: formattedDate
      });
      
      toast({
        title: 'Expense added',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setFormData({
        category: '',
        amount: '',
        description: '',
        expense_date: new Date()
      });
    } catch (error) {
      const errorData = handleApiError(error);
      toast({
        title: 'Error adding expense',
        description: errorData.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.category}>
          <FormLabel>Category</FormLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Select category"
            isDisabled={isLoadingCategories}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.category}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.amount}>
          <FormLabel>Amount</FormLabel>
          <NumberInput min={0.01} precision={2}>
            <NumberInputField
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </NumberInput>
          <FormErrorMessage>{errors.amount}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.expense_date}>
          <FormLabel>Date</FormLabel>
          <Box border="1px" borderColor="gray.200" borderRadius="md">
            <DatePicker
              selected={formData.expense_date}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              customInput={<Input />}
            />
          </Box>
          <FormErrorMessage>{errors.expense_date}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Description (Optional)</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add notes about this expense"
            rows={3}
          />
        </FormControl>

        <Stack direction="row" spacing={4} pt={2}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Saving..."
            w="full"
          >
            Save Expense
          </Button>
          
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              isDisabled={isLoading}
              w="full"
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ExpenseForm;