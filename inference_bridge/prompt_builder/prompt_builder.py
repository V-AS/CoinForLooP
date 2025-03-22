# inference_bridge/prompt_builder/prompt_builder.py
from datetime import datetime

class PromptBuilder:
    @staticmethod
    def build_goal_planning_prompt(
        goal_description: str,
        target_amount: float,
        deadline: str,
        user_income: float,
        avg_spending: float
    ) -> str:
        """
        Build a prompt for goal planning
        
        Args:
            goal_description: Description of the financial goal
            target_amount: Amount to save
            deadline: Deadline date in ISO format
            user_income: Monthly income
            avg_spending: Average monthly spending
            
        Returns:
            Formatted prompt for the OpenAI model
        """
        # Parse the deadline
        deadline_date = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        current_date = datetime.now()
        
        # Calculate months until deadline
        months_until_deadline = (
            (deadline_date.year - current_date.year) * 12 + 
            deadline_date.month - current_date.month
        )
        
        # Monthly savings needed
        monthly_savings_needed = target_amount / max(1, months_until_deadline)
        
        # Available monthly savings (income minus average spending)
        available_monthly_savings = user_income - avg_spending
        
        # Determine if goal is realistic
        is_realistic = available_monthly_savings >= monthly_savings_needed
        
        # Create the prompt
        prompt = f"""
        User wants to save ${target_amount:.2f} for {goal_description} by {deadline_date.strftime('%B %d, %Y')}.
        Their monthly income is ${user_income:.2f}, and current average spending is ${avg_spending:.2f}.

        Based on this information:
        - They need to save approximately ${monthly_savings_needed:.2f} per month to reach their goal
        - They currently have ${available_monthly_savings:.2f} available for monthly savings
        - The goal is {'realistic' if is_realistic else 'challenging'} based on their current finances

        Create a realistic savings plan that helps them achieve this goal. If the goal is unrealistic with their 
        current finances, suggest adjustments to make it feasible (reducing expenses, extending timeline, etc.).
        
        Provide specific, actionable advice in a friendly, encouraging tone. Format your response as a clear plan.
        """
        
        return prompt
    
    @staticmethod
    def build_monthly_summary_prompt(
        month: int,
        year: int,
        income: float,
        total_spending: float,
        budget_status: str,
        category_totals: dict,
        transactions: list
    ) -> str:
        """
        Build a prompt for monthly summary analysis
        
        Args:
            month: Month number (1-12)
            year: Year
            income: Monthly income
            total_spending: Total spending for the period
            budget_status: Under or over budget
            category_totals: Spending totals by category
            transactions: List of transaction data
            
        Returns:
            Formatted prompt for the OpenAI model
        """
        # Get month name
        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        month_name = month_names[month - 1]
        
        # Format transaction data for the prompt
        transaction_summary = "\n".join([
            f"- ${t.amount:.2f} on {t.category} ({t.date[:10]}): {t.description or 'No description'}"
            for t in transactions[:10]  # Limit to 10 transactions to avoid token limits
        ])
        
        if len(transactions) > 10:
            transaction_summary += f"\n- ... and {len(transactions) - 10} more transactions"
        
        # Create category breakdown for prompt
        category_breakdown = "\n".join([
            f"- {category}: ${amount:.2f} ({amount/total_spending*100:.1f}%)"
            for category, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        ])
        
        # Create the prompt
        prompt = f"""
        Analyze the following financial data for {month_name} {year}:
        
        Monthly Income: ${income:.2f}
        Total Spending: ${total_spending:.2f}
        Budget Status: {budget_status}
        
        Spending by Category:
        {category_breakdown}
        
        Recent Transactions:
        {transaction_summary}
        
        Please provide:
        1. A clear summary of the month's spending patterns
        2. Identify any categories with unusually high spending
        3. Suggest specific improvements to help the user better manage their finances
        4. If they are over budget, recommend practical ways to reduce expenses
        
        Format your response as a helpful, concise financial analysis. Be specific and actionable.
        """
        
        return prompt