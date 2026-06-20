"""Pytest setup: provide a SECRET_KEY for tests so the app imports.

Production still refuses to start without SECRET_KEY (security review SP-1); tests just
supply a throwaway value before the app/config module is imported.
"""
import os

os.environ.setdefault("SECRET_KEY", "test-only-secret")
os.environ.setdefault("DEV_MODE", "true")
