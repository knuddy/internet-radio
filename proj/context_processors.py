from django.conf import settings


def application_name(_):
    return {'APPLICATION_NAME': settings.APPLICATION_NAME}
