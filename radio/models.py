import uuid
from django.db import models


class Track(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, blank=False, null=False)
    thumbnail_url = models.URLField(blank=True, null=True)
    filename = models.CharField(max_length=20, blank=False, null=False)
    has_played = models.BooleanField(default=False, blank=False, null=False)
    time_added = models.DateTimeField(auto_now_add=True)
