import logging

from petopredict_agent.client.client_factory import ClientFactory
from petopredict_agent.config.app_config import AppConfig, PromptConfig
from petopredict_agent.config.app_config_factory import AppConfigFactory
from petopredict_agent.data.parsing.breed_prediction_gen_response import (
    BreedPredictionGenResponse,
)
from petopredict_agent.data.request.breed_predict_request import BreedPredictRequest
from petopredict_agent.data.response.breed_prediction_response import (
    BreedPredictionResponse,
)
from petopredict_agent.exception.predict_exception import EmptyPredictException
from petopredict_agent.processor.processor_base import ProcessorBase
from petopredict_agent.prompt_builder.prompt_builder import (
    PromptBuilder,
)

logger: logging.Logger = logging.getLogger(__name__)


class BreedPredictProcessor(
    ProcessorBase[
        BreedPredictRequest, BreedPredictionGenResponse, BreedPredictionResponse
    ]
):
    def __init__(self):
        super().__init__(BreedPredictionGenResponse)

    async def construct_message(
        self, breed_predict_request: BreedPredictRequest
    ) -> list:
        """Constructs the message to be sent to the model"""
        app_config: AppConfig = AppConfigFactory.get(breed_predict_request.version_id)
        prompt_config: PromptConfig = app_config.prompt_config

        s3_client = ClientFactory.get_s3_client()
        image_url = await s3_client.get_presigned_url(
            file_key=breed_predict_request.image_key
        )
        messages = [
            {
                "role": "system",
                "content": PromptBuilder.breed_detection_system_prompt(
                    prompt_config=prompt_config
                ),
            },
            {
                "role": "user",
                "temperature": 0,
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                            "detail": "low",
                        },
                    }
                ],
            },
        ]
        return messages

    def parse_response_from_completion(
        self, gen_result: BreedPredictionGenResponse
    ) -> BreedPredictionResponse:
        if (
            not gen_result.species
            or not gen_result.results
            or not gen_result.results[0]
            or not gen_result.results[0].guess
        ):
            raise EmptyPredictException()

        return BreedPredictionResponse(
            species=gen_result.species, breed=gen_result.results[0].guess
        )
