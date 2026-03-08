FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/backend/

WORKDIR /app/backend/

CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
