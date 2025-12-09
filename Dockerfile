# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY templates/ templates/
COPY static/ static/

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_DEBUG=False
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "app.py"]
