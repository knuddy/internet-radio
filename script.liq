
# settings.server.telnet.set(true)
# server.harbor(port=9080)

def playnow(~protocol, ~data, ~headers, uri) =
    arr = json.parse(default=[("track","none")], data)  
    track = arr["track"];
    
    if track != "none" then
        server.execute("playnow.push #{track}")
        log("adding playnow track '#{track}'")
    else
        log("no track added")
    end
    
    http.response(
        protocol=protocol,
        code=200,
        content_type="application/json; charset=utf-8",
        data='{"status":"success", "track": "#{track}"}'
    )
end

house = playlist('/music/!playlist.m3u')
radio = mksafe(house)
radio = random([radio])

# requested = request.queue(id="playnow")

# radio = fallback(track_sensitive=false, [requested, radio])

output.icecast(%mp3,
    host = "icecast",
    port = 10024,
    password = "hackme",
    mount = "station",
    radio
)

# harbor.http.register(port=9080, method="POST","/playnow", playnow)