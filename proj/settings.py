import os
import mimetypes
from pathlib import Path
from django.urls import reverse_lazy

mimetypes.add_type('application/javascript', '.js', True)

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-+(s3lz!)*9+)7p)_42p5*945kt#h5gp5hfdf^cgel46xy%og$p'

DEBUG = True

ALLOWED_HOSTS = ['*']

APPLICATION_NAME = "scuisi.fm"

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'django_celery_beat',
    'django_htmx',
    'proj',
    'radio',
]

LOGIN_URL = reverse_lazy('login')
LOGOUT_URL = reverse_lazy('logout')
LOGIN_REDIRECT_URL = reverse_lazy('index')
# LOGOUT_REDIRECT_URL = reverse_lazy('index')

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware'
]

ROOT_URLCONF = 'proj.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'proj.context_processors.application_name'
            ],
        },
    },
]

WSGI_APPLICATION = 'proj.wsgi.application'
ASGI_APPLICATION = 'proj.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE_DEFAULT', 'django.db.backends.postgresql'),
        'NAME': os.environ.get('DB_NAME_DEFAULT', 'postgres'),
        'USER': os.environ.get("DB_USER_DEFAULT", 'postgres'),
        'PASSWORD': os.environ.get("DB_PASSWORD_DEFAULT", 'postgres'),
        "HOST": os.environ.get("DB_HOST_DEFAULT", 'localhost'),
        "PORT": os.environ.get("DB_PORT_DEFAULT", '1396'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_URL = "/staticfiles/"
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


CELERY_TIMEZONE = 'Pacific/Auckland'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BROKER_URL = os.environ.get("DJANGO_CELERY_BROKER_URL", 'redis://127.0.0.1:6379')

REDIS_HOST = os.environ.get("REDIS_HOST", default="127.0.0.1")
REDIS_PORT = os.environ.get("REDIS_PORT", default=6379)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get("REDIS_HOST", '127.0.0.1'), os.environ.get("REDIS_PORT", 6379))],
        },
    },
}

EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
EMAIL_FILE_PATH = BASE_DIR / "sent_emails"

