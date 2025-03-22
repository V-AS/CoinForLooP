# inference_bridge/processors/summary_processor.py
from collections import defaultdict
from inference_bridge.client.openai_client import OpenAIClient
from inference_bridge.prompt_builder.prompt_builder import PromptBuilder
from inference_bridge.data.request.summary_request import SummaryRequest
from inference_bridge.data.response.summary_response import SummaryResponse
import logging

logger = logging.getLogger(__name__)

class SummaryProcessor:
    def __init__(self):
        self.openai_client = OpenAIClient()
    
    async def process(self, request: SummaryRequest) -> SummaryResponse:
        """
        Process a monthly summary request
        
        Args:
            request: Monthly summary request data
            
        Returns:
            Monthly summary response with AI-generated insights
        """
        try:
            # Calculate totals by category
            category_totals = defaultdict(float)
            for transaction in request.transactions:
                category_totals[transaction.category] += transaction.amount
            
            # Convert to regular dict for JSON serialization
            top_categories = dict(category_totals)
            
            # Calculate total spending
            total_spending = sum(transaction.amount for transaction in request.transactions)
            
            # Determine if under or over budget
            budget_status = "Under Budget" if total_spending < request.income else "Over Budget"
            
            # Build prompt using the PromptBuilder
            prompt = PromptBuilder.build_monthly_summary_prompt(
                month=request.month,
                year=request.year,
                income=request.income,
                total_spending=total_spending,
                budget_status=budget_status,
                category_totals=top_categories,
                transactions=request.transactions
            )
            
            # Generate AI response
            summary = self.openai_client.generate_text(prompt)
            
            # Return the response
            return SummaryResponse(
                summary=summary,
                top_categories=top_categories,
                total_spending=total_spending,
                budget_status=budget_status
            )
        
        except Exception as e:
            logger.error(f"Error processing monthly summary request: {e}")
            raise