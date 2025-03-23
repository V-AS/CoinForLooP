# inference_bridge/prompt_builder/prompt_builder.py
from datetime import datetime
from typing import List, Dict, Any, Optional


class PromptBuilder:
    @staticmethod
    def build_goal_planning_prompt(
        goal_description: str,
        target_amount: float,
        deadline: str,
        user_income: float,
        transactions: List,
        priority: Optional[int] = 0,
    ) -> str:
        """
        Build a prompt for financial goal planning.

        Args:
            goal_description: Description of the financial goal
            target_amount: Amount to save
            deadline: Deadline date in ISO format
            user_income: Monthly income
            transactions: List of transaction data for previous 2 months
            priority: Priority level of the goal (0-5, with 5 being highest)

        Returns:
            Formatted prompt for the language model
        """
        # Parse the deadline
        deadline_date = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        current_date = datetime.now()

        # Calculate months remaining until deadline
        months_remaining = (
            (deadline_date.year - current_date.year) * 12
            + deadline_date.month
            - current_date.month
        )

        # Calculate required monthly savings
        required_monthly_savings = (
            target_amount / months_remaining if months_remaining > 0 else target_amount
        )

        # Format priority
        priority_text = "Not specified" if priority == 0 else f"{priority}/5"

        # Create the prompt
        prompt = f"""
    You are a helpful financial advisor creating a personalized savings plan. Here's the user's situation:

    GOAL ANALYSIS:
    - Goal: Save ${target_amount:.2f} for {goal_description}
    - Deadline: {deadline_date.strftime('%B %d, %Y')} ({months_remaining} months remaining)
    - Monthly income: ${user_income:.2f}
    - Required monthly savings to reach goal: ${required_monthly_savings:.2f}
    - Goal priority: {priority_text}
    - User transactions for the past 2 months: {transactions} transactions

    INSTRUCTIONS:
    1. First assess if the goal is realistically achievable given the user's financial situation
    2. Create a concise savings plan (around 40 words) that helps them achieve this goal
    3. If the goal appears difficult to achieve, suggest specific, actionable adjustments (reducing specific expenses, extending timeline, etc.)
    4. Provide your response in a friendly, encouraging tone
    5. Use "you" instead of "the user" to make the response personal
    6. Structure your response clearly with a brief assessment and then the plan
    7. if the goal is easily achievable, you can skip the recommendation and focus on encouragement.

    FORMAT:
    - Use plain text only (no markdown or special formatting)
    - Begin with a brief assessment of feasibility
    - Follow with specific, actionable advice
    - Be honest but encouraging about challenging goals
    - Do not simply suggest "setting aside money each month" - provide specific strategies

    SAMPLE RESPONSE STRUCTURE:
    "This goal appears [achievable/challenging] based on your finances. [Brief reason why]

    To reach your goal, I recommend: [specific savings strategy with actionable steps]
    
    """
        return prompt

    @staticmethod
    def build_monthly_summary_prompt(
        month: int,
        year: int,
        income: float,
        total_spending: float,
        budget_status: str,
        category_totals: Dict,
        transactions: List
    ) -> str:
        """
        Build a prompt for monthly financial summary analysis.
        
        Args:
            month: Month number (1-12)
            year: Year
            income: Monthly income
            total_spending: Total spending for the period
            budget_status: Under or over budget
            category_totals: Spending totals by category
            transactions: List of transaction data
            
        Returns:
            Formatted prompt for the language model
        """
        # Get month name
        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        month_name = month_names[month - 1]
        
        # Calculate savings and spending percentage
        savings = income - total_spending
        spending_pct = (total_spending / income * 100) if income > 0 else 0
        
        # Format transaction data for the prompt
        transaction_summary = ""
        for i, t in enumerate(transactions[:5]):  # Limit to 5 transactions
            # Handle both dictionary and object formats
            if isinstance(t, dict):
                amount = t.get('amount', 0)
                category = t.get('category', 'Uncategorized')
                date = t.get('date', '')[:10]
                description = t.get('description', 'No description')
            else:
                amount = getattr(t, 'amount', 0)
                category = getattr(t, 'category', 'Uncategorized')
                date = getattr(t, 'date', '')[:10]
                description = getattr(t, 'description', 'No description')
                
            transaction_summary += f"- ${amount:.2f} on {category} ({date}): {description}\n"
            
        if len(transactions) > 5:
            transaction_summary += f"- ... and {len(transactions) - 5} more transactions"
            
        # Create category breakdown for prompt (top 5 categories)
        sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        top_categories = sorted_categories[:5]
        
        category_breakdown = ""
        for category, amount in top_categories:
            percentage = (amount / total_spending * 100) if total_spending > 0 else 0
            category_breakdown += f"- {category}: ${amount:.2f} ({percentage:.1f}%)\n"
            
        if len(category_totals) > 5:
            other_amount = sum(amount for _, amount in sorted_categories[5:])
            other_percentage = (other_amount / total_spending * 100) if total_spending > 0 else 0
            category_breakdown += f"- Other categories: ${other_amount:.2f} ({other_percentage:.1f}%)\n"
        
        # Create the prompt
        prompt = f"""
You are a personal financial advisor analyzing a monthly financial summary. Create a concise, personalized assessment based on this data:

FINANCIAL SUMMARY: {month_name} {year}
- Income: ${income:.2f}
- Total Spending: ${total_spending:.2f} ({spending_pct:.1f}% of income)
- Net Savings: ${savings:.2f}
- Budget Status: {budget_status}

TOP SPENDING CATEGORIES:
{category_breakdown}

SAMPLE TRANSACTIONS:
{transaction_summary}

INSTRUCTIONS:
Create a helpful financial analysis (maximum 75 words) with:
1. A clear summary of the month's spending patterns
2. Identification of 1-2 categories with unusually high spending
3. 1-2 specific, actionable recommendations to improve financial health

GUIDELINES:
- Use a conversational tone with "you" rather than "the user"
- Focus on insights rather than repeating numbers
- If over budget, prioritize practical expense reduction strategies
- Highlight positive financial behaviors to encourage good habits
- Use plain text (no markdown or special formatting)
- Balance honesty with encouragement

RESPONSE STRUCTURE:
- Start with a brief overview of the month's financial performance
- Identify key insights about spending patterns
- Provide specific, actionable recommendations
"""
        return prompt