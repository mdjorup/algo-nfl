FROM python:3.11-slim

# Copy your script into the container

WORKDIR /app

COPY *.py .

COPY .env.prod .env

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

CMD ["python", "main.py"]