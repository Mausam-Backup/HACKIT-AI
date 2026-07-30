from pydantic import BaseModel, field_validator
import yaml
import os


class Config(BaseModel):
    http_timeout: int = 3600
    server_port: int = 4190
    strict_models: bool = False
    max_repair_attempts: int = 2

    coach_model: str = "default"
    builder_model: str = "default"

    builder_timeout: int = 1800

    coach_timeout: int = 300

    @field_validator("server_port")
    @classmethod
    def port_range(cls, v):
        if v < 1024 or v > 65535:
            raise ValueError(f"server_port must be between 1024 and 65535, got {v}")
        return v

    @field_validator("max_repair_attempts")
    @classmethod
    def repair_range(cls, v):
        if v < 0 or v > 10:
            raise ValueError(f"max_repair_attempts must be between 0 and 10, got {v}")
        return v

    @field_validator("http_timeout", "builder_timeout", "coach_timeout")
    @classmethod
    def timeout_positive(cls, v, info):
        if v < 1:
            raise ValueError(f"{info.field_name} must be at least 1s, got {v}")
        return v

    @classmethod
    def from_yaml(cls, path: str = "config.yaml") -> "Config":
        if not os.path.exists(path):
            print(f"  Config '{path}' not found — using defaults", flush=True)
            return cls()
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return cls(**(data or {}))
