import os
import shutil
import tempfile
import json
import pytest

from stack_manager import list_stacks, resolve_stack, save_project_stack, load_project_stack, DEFAULT_STACK

def test_list_stacks():
    stacks = list_stacks()
    assert "default" in stacks
    assert "fastapi-vue" in stacks
    assert "nextjs" in stacks
    assert "go-htmx" in stacks
    assert "flask-react" in stacks
    assert "svelte-express" in stacks

def test_resolve_stack_default():
    s = resolve_stack(None)
    assert s["id"] == "default"

def test_resolve_stack_by_name():
    s = resolve_stack("fastapi-vue")
    assert s["id"] == "fastapi-vue"
    assert s["frontend"]["framework"] == "Vue 3"
    assert s["backend"]["framework"] == "Python 3 / FastAPI"

def test_resolve_stack_by_dict():
    custom = {
        "id": "my-custom",
        "name": "Custom Stack",
        "frontend": {"framework": "Angular"},
        "backend": {"framework": "Django"}
    }
    s = resolve_stack(custom)
    assert s["id"] == "my-custom"
    assert s["frontend"]["framework"] == "Angular"

def test_save_and_load_project_stack():
    with tempfile.TemporaryDirectory() as tmp_dir:
        custom_stack = {
            "id": "fastapi-vue",
            "name": "Vue 3 + Python FastAPI",
            "frontend": {"framework": "Vue 3"},
            "backend": {"framework": "FastAPI"}
        }
        save_project_stack(tmp_dir, custom_stack)
        assert os.path.exists(os.path.join(tmp_dir, "stack_config.json"))

        loaded = load_project_stack(tmp_dir)
        assert loaded["id"] == "fastapi-vue"
        assert loaded["frontend"]["framework"] == "Vue 3"
