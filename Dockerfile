FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

WORKDIR /app

COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt && \
    python manage.py collectstatic --noinput && \
    python manage.py migrate --noinput

EXPOSE 10000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application -b 0.0.0.0:$PORT --workers 2 --timeout 60"]
