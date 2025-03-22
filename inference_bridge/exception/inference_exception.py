class InferenceException(Exception):
    def __init__(self, code: int, message: str) -> None:
        super().__init__(message)
        self.code = code

    def __str__(self):
        # Customize the string representation of the exception
        return f"[Error {self.code}] {self.args[0]}"


"""
Internal exceptions
Error code format: 1xx
"""


class EmptyResponseException(InferenceException):
    def __init__(self) -> None:
        super().__init__(code="INF_101", message="Inference returns empty response")


class GenResponseParsingException(InferenceException):
    def __init__(self) -> None:
        super().__init__(code="INF_102", message="Failed to parse gen response")


"""
External exceptions caused by inference dependencies
Error code format: 2xx
"""


class OpenaiInferenceException(InferenceException):
    def __init__(self, message: str) -> None:
        super().__init__(code="INF_201", message=message)
