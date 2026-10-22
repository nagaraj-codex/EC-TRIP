#!/bin/bash
set -e
FOUND=0

FILES=$(git ls-files | grep -Ei '\.(py|pyc|pyo|pyd|pyw|pyi|ipynb)$' || true)
if [ -n "$FILES" ]; then
    echo "ERROR: Found Python files in the repository:"
    echo "$FILES"
    FOUND=1
fi

REFS=$(git ls-files | grep -v 'scripts/check-no-python.sh' | grep -v 'scripts/check-no-python.ps1' | grep -v '.gitignore' | grep -v '.vscode/' | grep -v '^docs/' | xargs grep -ilE '(^|[^a-zA-Z0-9_-])python|pip install|uvicorn|fastapi|flask|django|pydantic|sqlalchemy|alembic|gunicorn|requirements\.txt|venv|\.py\b' | grep -v 'check-no-python' || true)
if [ -n "$REFS" ]; then
    echo "ERROR: Found Python references in:"
    echo "$REFS"
    FOUND=1
fi

if [ "$FOUND" -eq 1 ]; then
    echo "Python purge failed."
    exit 1
fi

echo "No Python remnants found. Project is clean."
exit 0
