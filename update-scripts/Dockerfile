FROM python:3.11-slim

# Install cron
RUN apt-get update && apt-get install -y cron

# Copy your script into the container
COPY script.py /app/script.py
COPY cronjob /etc/cron.d/cronjob

RUN chmod 0644 /etc/cron.d/cronjob

RUN crontab /etc/cron.d/cronjob

RUN touch /var/log/cron.log

CMD cron && tail -f /var/log/cron.log