"""
Bobby — LLM Client (Abstraction Layer)
========================================
Provides a single interface for LLM calls.
Switches between OpenAI (demo) and Azure OpenAI (production)
based on APP_ENV without any code changes.
"""
from __future__ import annotations
from functools import lru_cache
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from config.settings import settings


def get_llm(json_mode: bool = False):
    """
    Returns the appropriate LLM client based on APP_ENV.

    Args:
        json_mode: If True, sets response_format to JSON object.
                   Use for structured extraction (triage, slot filling).

    Returns:
        LangChain ChatModel instance (OpenAI or Azure)
    """
    kwargs = {}
    if json_mode:
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}

    if settings.is_demo:
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0,
            streaming=True,
            **kwargs,
        )
    else:
        return AzureChatOpenAI(
            api_key=settings.azure_openai_api_key,
            azure_endpoint=settings.azure_openai_endpoint,
            azure_deployment=settings.azure_openai_deployment,
            api_version=settings.azure_openai_api_version,
            temperature=0,
            streaming=True,
            **kwargs,
        )


def get_embedding_model():
    """Returns the appropriate embedding model based on APP_ENV."""
    from langchain_openai import OpenAIEmbeddings, AzureOpenAIEmbeddings

    if settings.is_demo:
        return OpenAIEmbeddings(
            api_key=settings.openai_api_key,
            model=settings.openai_embedding_model,
        )
    else:
        return AzureOpenAIEmbeddings(
            api_key=settings.azure_openai_api_key,
            azure_endpoint=settings.azure_openai_endpoint,
            azure_deployment=settings.azure_openai_embedding_deployment,
            api_version=settings.azure_openai_api_version,
        )
