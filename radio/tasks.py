import requests
import yt_dlp
from asgiref.sync import async_to_sync
from proj import celery_app
from channels.layers import get_channel_layer


@celery_app.task
def hit_joke_endpoint(group_name: str):
    channel_layer = get_channel_layer()
    response = requests.get("https://official-joke-api.appspot.com/random_joke")
    if response.ok:
        async_to_sync(channel_layer.group_send)(group_name, {
            'type': 'joke.response',
            'joke': response.json()
        })


@celery_app.task
def queue_song(url: str):
    ydl_opts = {
        "noplaylist": True,
        'format': 'm4a/bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
        "outtmpl": "music/%(id)s.%(ext)s"

    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.sanitize_info(ydl.extract_info(url, download=False))

        ydl.download([url])

        # ℹ️ ydl.sanitize_info makes the info json-serializable
        # pprint(sorted(list(info.keys())))

        print(info['playlist'])
        # pprint(info['thumbnails'])
        # print(info['title'])
