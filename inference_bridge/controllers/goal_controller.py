from inference_bridge.data.request import GoalPlanningRequest
from inference_bridge.data.response import GoalPlanningResponse
from inference_bridge.exception import InferenceException
from inference_bridge.processors import GoalPlanningProcessor
from typing import Any


async def plan_goal(self, goal_planning_request: GoalPlanningRequest) -> None:
        processor = GoalPlanningProcessor()
        result = await processor.run(goal_planning_request)
        return result

async def run(self, payload:  dict[str, Any]) -> GoalPlanningResponse:
        goal_planning_request: GoalPlanningRequest = GoalPlanningRequest(
            # Extract data from payload
        )
        
        return await self.plan_goal(breed_predict_request=goal_planning_request)