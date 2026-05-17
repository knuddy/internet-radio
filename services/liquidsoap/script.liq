# --- Environment Configuration ---
icecast_host = environment.get("LIQUIDSOAP_IC_HOST", default="icecast")
stream_port  = environment.get("LIQUIDSOAP_IC_PORT", default="10024")
icecast_pwd  = environment.get("LIQUIDSOAP_IC_PWD", default="hackme")
stream_mount = environment.get("LIQUIDSOAP_IC_MOUNT", default="/station")

# Convert the string port value into an Integer required by Liquidsoap's network socket layer
stream_port_int = int_of_string(stream_port)


# Holds local file paths (e.g., "/music/downloads/song.mp3") sent by your backend
user_queue = request.queue(id="user_requests")

# Reads a local directory or an M3U playlist file.
# 'shuffled=true' randomizes the playback order natively.
preset_playlist = playlist(mode="randomize", reload_mode="rounds", "/audio/presets/")

# track_sensitive=true ensures the current song finishes smoothly before playing the user request.
radio = fallback(track_sensitive=true, [user_queue, preset_playlist])
radio = mksafe(radio)

output.icecast(%opus,
    host = icecast_host,
    port = stream_port_int,
    password = icecast_pwd,
    mount = stream_mount,
    radio
)

# Your backend app will POST the local absolute path of the downloaded YouTube track here.
def queue_user_track(req, res) =
    # Read the body data from the request object
    payload = json.parse(default={path="none"}, req.body())
    file_path = payload.path

    if file_path != "" and file_path != "none" then
        let track_request = request.create(file_path)
        user_queue.push(track_request)

        log("Successfully queued local track: #{file_path}")

        # 2. Use the response object helper methods to set status and body
        res.status_code(200)
        res.json({status = "success"})
    else
        log("Failed to queue: No valid 'path' found in JSON payload.")

        res.status_code(400)
        res.json({status = "error"})
    end
end

# Open port 9080 to listen for the backend's local POST requests
harbor.http.register(port=9080, method="POST", "/interrupt", queue_user_track)