// frontend/src/components/MonthSelector.js
import React from 'react';

const MonthSelector = ({ currentMonth, currentYear, onChange, availablePeriods }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const renderYearOptions = () => {
    if (!availablePeriods) return null;
    
    return availablePeriods.years.map(year => (
      <option key={year} value={year}>{year}</option>
    ));
  };
  
  const renderMonthOptions = () => {
    if (!availablePeriods || !availablePeriods.months[currentYear]) return null;
    
    return availablePeriods.months[currentYear].map(monthIndex => (
      <option key={monthIndex} value={monthIndex}>
        {months[monthIndex - 1]}
      </option>
    ));
  };

  const years = [];
  const currentFullYear = new Date().getFullYear();
  for (let i = currentFullYear - 2; i <= currentFullYear; i++) {
    years.push(i);
  }

  const handleMonthChange = (e) => {
    onChange({ month: parseInt(e.target.value), year: currentYear });
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    
    // If we have available periods, we need to select a valid month for the new year
    if (availablePeriods && availablePeriods.months[newYear]) {
      // If current month is available in the new year, keep it
      if (availablePeriods.months[newYear].includes(currentMonth)) {
        onChange({ month: currentMonth, year: newYear });
      } else {
        // Otherwise, select the first available month in that year
        const firstAvailableMonth = availablePeriods.months[newYear][0];
        onChange({ month: firstAvailableMonth, year: newYear });
      }
    } else {
      // No available periods info, just change the year
      onChange({ month: currentMonth, year: newYear });
    }
  };

  // Determine which years to show (from API or default)
  const yearsToShow = availablePeriods ? availablePeriods.years : years;
  
  // Determine which months to show for the selected year
  const monthsToShow = availablePeriods && availablePeriods.months[currentYear] 
    ? availablePeriods.months[currentYear] 
    : Array.from({ length: 12 }, (_, i) => i + 1); // All months (1-12)

  return (
    <div className="month-selector">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select 
          value={currentMonth} 
          onChange={handleMonthChange}
          style={{ 
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            width: 'auto',
            minWidth: '120px'
          }}
        >
          {months.map((name, index) => (
            <option key={name} value={index + 1}>{name}</option>
          ))}
        </select>
        
        <select 
          value={currentYear} 
          onChange={handleYearChange}
          style={{ 
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            width: 'auto',
            minWidth: '80px'
          }}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthSelector;