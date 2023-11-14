Run with:

`uvicorn proj.asgi:application --reload --reload-include '*.py' --reload-include '*.html' --reload-include '*.js' --reload-include '*.css' --reload-exclude 'venv' --reload-exclude 'staticfiles/' --host localhost --port 8005
`
