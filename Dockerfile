FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE = 1
ENV PYTHONUNBUFFERED = 1
ENV DJANGO_ALLOWED_HOSTS = []

RUN useradd --user-group --system --create-home --no-log-init app

ENV HOME=/home/app
ENV APP_HOME=/usr/src/app
WORKDIR $APP_HOME

RUN export DEBIAN_FRONTEND=noninteractive; \
    export DEBCONF_NONINTERACTIVE_SEEN=true; \
    echo 'tzdata tzdata/Areas select Pacific' | debconf-set-selections; \
    echo 'tzdata tzdata/Zones/Pacific select UTC' | debconf-set-selections; \
    apt-get update -qqy \
 && apt-get install -y curl gnupg2 ca-certificates -qqy --no-install-recommends \
        tzdata

RUN apt-get install --no-install-recommends -y libpq-dev gcc python3-dev musl-dev ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


RUN pip3 install --upgrade pip
COPY requirements.txt .
RUN pip3 install -r requirements.txt

RUN chown -R app:app $APP_HOME

USER app

COPY entrypoint.sh .
ENTRYPOINT ["bash", "/usr/src/app/entrypoint.sh"]