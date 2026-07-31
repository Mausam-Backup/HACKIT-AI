import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config import Config


class TestConfig:
    def test_defaults(self):
        c = Config()
        assert c.http_timeout == 3600
        assert c.server_port == 4190
        assert c.strict_models is False
        assert c.max_repair_attempts == 2
        assert c.coach_model == "default"
        assert c.builder_model == "default"
        assert c.coach_timeout == 300
        assert c.builder_timeout == 1800

    def test_custom_values(self):
        c = Config(
            http_timeout=600,
            server_port=5000,
            strict_models=True,
            max_repair_attempts=2,
            coach_model="hackit/gpt-5-nano",
            builder_model="hackit/gpt-5-nano",
        )
        assert c.http_timeout == 600
        assert c.server_port == 5000
        assert c.strict_models is True
        assert c.max_repair_attempts == 2
        assert c.coach_model == "hackit/gpt-5-nano"
        assert c.builder_model == "hackit/gpt-5-nano"

    def test_from_yaml_nonexistent(self):
        c = Config.from_yaml("C:\\nonexistent_path_xyz.yaml")
        assert isinstance(c, Config)
        assert c.server_port == 4190

    def test_from_yaml_valid(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "test_config.yaml")
            with open(fpath, "w") as f:
                f.write("server_port: 8080\nmax_repair_attempts: 2\n")
            c = Config.from_yaml(fpath)
            assert c.server_port == 8080
            assert c.max_repair_attempts == 2
            assert c.http_timeout == 3600

    def test_from_yaml_empty_file(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "empty.yaml")
            with open(fpath, "w") as f:
                f.write("")
            c = Config.from_yaml(fpath)
            assert c.server_port == 4190

    def test_extra_fields_ignored(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "extra.yaml")
            with open(fpath, "w") as f:
                f.write("server_port: 8080\niterations: 6\nunknown_field: true\n")
            c = Config.from_yaml(fpath)
            assert c.server_port == 8080
