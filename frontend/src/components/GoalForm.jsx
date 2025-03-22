// src/components/GoalForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  NumberInput,
  NumberInputField,
  useToast,
  FormErrorMessage,
  Text
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { goalAPI, handleApiError } from '../services/api';
import { format, addMonths } from 'date-fns';

const GoalForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    target_amount: initialData?.target_amount?.toString() || '',
    current_amount: initialData?.current_amount?.toString() || '0',
    target_date: initialData?.target_date 
      ? new Date(initialData.target_date) 
      : addMonths(new Date(), 6)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  
  const isEditing = !!initialData;

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
      target_date: date
    }));
    
    // Clear error when field is edited
    if (errors.target_date) {
      setErrors(prev => ({ ...prev, target_date: null }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.target_amount || isNaN(parseFloat(formData.target_amount)) || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Valid target amount is required';
    }
    
    if (!formData.current_amount || isNaN(parseFloat(formData.current_amount)) || parseFloat(formData.current_amount) < 0) {
      newErrors.current_amount = 'Valid current amount is required';
    }
    
    if (parseFloat(formData.current_amount) > parseFloat(formData.target_amount)) {
      newErrors.current_amount = 'Current amount cannot exceed target amount';
    }
    
    if (!formData.target_date) {
      newErrors.target_date = 'Target date is required';
    } else if (formData.target_date < new Date()) {
      newErrors.target_date = 'Target date must be in the future';
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
      const formattedDate = format(formData.target_date, 'yyyy-MM-dd');
      
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: formattedDate
      };
      
      if (isEditing) {
        // Update existing goal
        await goalAPI.updateGoal(initialData.id, goalData);
        toast({
          title: 'Goal updated',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Create new goal
        await goalAPI.addGoal(goalData);
        toast({
          title: 'Goal created',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorData = handleApiError(error);
      toast({
        title: isEditing ? 'Error updating goal' : 'Error creating goal',
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
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Goal Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., New Laptop, Vacation, Emergency Fund"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.target_amount}>
          <FormLabel>Target Amount</FormLabel>
          <NumberInput min={0.01} precision={2}>
            <NumberInputField
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </NumberInput>
          <FormErrorMessage>{errors.target_amount}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.current_amount}>
          <FormLabel>Current Progress (if any)</FormLabel>
          <NumberInput min={0} precision={2}>
            <NumberInputField
              name="current_amount"
              value={formData.current_amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </NumberInput>
          <FormErrorMessage>{errors.current_amount}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.target_date}>
          <FormLabel>Target Date</FormLabel>
          <Box border="1px" borderColor="gray.200" borderRadius="md">
            <DatePicker
              selected={formData.target_date}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              customInput={<Input />}
            />
          </Box>
          <FormErrorMessage>{errors.target_date}</FormErrorMessage>
        </FormControl>

        {formData.target_amount && formData.target_date && (
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontWeight="medium">
              {parseFloat(formData.target_amount) > 0 && formData.target_date > new Date() && (
                <>
                  You'll need to save approximately $
                  {((parseFloat(formData.target_amount) - parseFloat(formData.current_amount || 0)) /
                    Math.max(1, Math.ceil(
                      (formData.target_date - new Date()) / (1000 * 60 * 60 * 24 * 30)
                    ))).toFixed(2)}{' '}
                  per month to reach your goal.
                </>
              )}
            </Text>
          </Box>
        )}

        <Stack direction="row" spacing={4} pt={2}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText={isEditing ? "Updating..." : "Creating..."}
            w="full"
          >
            {isEditing ? "Update Goal" : "Create Goal"}
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

export default GoalForm;