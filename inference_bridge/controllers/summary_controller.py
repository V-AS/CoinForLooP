# inference_bridge/controllers/summary_controller.py
from data.request.summary_request import SummaryRequest
from data.response.summary_response import SummaryResponse
from processors.summary_processor import SummaryProcessor
import logging

logger = logging.getLogger(__name__)

async def process_monthly_summary(request: SummaryRequest) -> SummaryResponse:
    """
    Process a monthly summary request by passing it to the appropriate processor
    
    Args:
        request: The monthly summary request data
        
    Returns:
        The monthly summary response with AI-generated insights
    """
    try:
        # Create processor instance
        processor = SummaryProcessor()
        
        # Process the request
        result = await processor.process(request)
        
        return result
    
    except Exception as e:
        logger.error(f"Error in monthly summary controller: {e}")
        raise