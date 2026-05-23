# --- Environment Configuration ---
server_port = environment.get("LIQUIDSOAP_PORT", default="9080")
icecast_host = environment.get("LIQUIDSOAP_IC_HOST", default="icecast")
stream_port  = environment.get("LIQUIDSOAP_IC_PORT", default="10024")
icecast_pwd  = environment.get("LIQUIDSOAP_IC_PWD", default="hackme")
stream_mount = environment.get("LIQUIDSOAP_IC_MOUNT", default="/station")

# Convert the string port value into an Integer required by Liquidsoap's network socket layer
server_port_int = int_of_string(server_port)
stream_port_int = int_of_string(stream_port)

# Create a thread-safe local reference list to store paths waiting to be played
waiting_queue = ref([])

# Define a dynamic source picker function.
# Liquidsoap calls this automatically when the previous user request finishes.
def get_next_user_request() =
    q = waiting_queue()
    if list.length(q) > 0 then
        # Grab the first file path and remove it from our queue list (pop)
        file_path = list.hd(default="", q)
        waiting_queue.set(list.tl(q))

        log("Consuming and playing track from the request queue: #{file_path}")

        # Create a single-use track request
        request.create(file_path)
    else
        # This null explicitly tells the fallback engine there are no tracks.
        null
    end
end

# Holds local file paths (e.g., "/audio/downloads/*.mp3") sent by a request backend
user_queue = request.dynamic(id="user_requests", get_next_user_request)

history_size = 1
recent_tracks = ref([])

# This function intercepts the playlist's next random pick.
# If the playlist randomly tries to play the exact same track that's played too recently
# returning false forces it to cleanly skip it and pick another file.
def prevent_recent_repeats(r) =
    next_file = request.filename(r)
    not list.mem(next_file, recent_tracks())
end

# Reads a local directory for the playlist tracks.
# mode="randomize" randomizes the playback order.
rotation = playlist(
    id="rotation",
    mode="randomize",
    reload_mode="rounds",
    check_next=prevent_recent_repeats,
    mime_type="audio/x-mpegurl",
    "/audio/playlists/rotation.m3u"
)

# track_sensitive=true ensures the current song finishes smoothly before playing the user request.
radio = fallback(track_sensitive=false, [user_queue, rotation])
radio = mksafe(radio)

def track_history_updater(m) =
    if rotation.length() > (history_size + 1) then
        current_file = m["filename"]
        current_history = recent_tracks()

        # Add the new track to the end of our history tracking list
        updated_history = list.append(current_history, [current_file])

        # If the history grows larger than our threshold, drop the oldest track from the front
        if list.length(updated_history) > history_size then
            recent_tracks.set(list.tl(updated_history))
        else
            recent_tracks.set(updated_history)
        end
    else
        # If there aren't enough tracks clear the history just in-case there
        # are leftovers from a previous playlist that did have enough tracks.
        recent_tracks.set([])
    end
end

radio.on_track(synchronous=false, track_history_updater)

output.icecast(%opus,
    host = icecast_host,
    port = stream_port_int,
    password = icecast_pwd,
    mount = stream_mount,
    radio
)

# Your backend app will POST the local absolute path of the downloaded YouTube track here.
def queue_user_track(req, res) =
    try
        # Read the body data from the request object
        let json.parse (payload : {path: string}) = req.body()
        file_path = payload.path

        if file_path != "" and file_path != "none" then
            waiting_queue.set(list.append(waiting_queue(), [file_path]))

            log("Successfully appended track to queue: #{file_path}")
            res.status_code(200)
        else
            log("Failed to queue track. No valid 'path' found in JSON payload.")
            res.status_code(400)
        end
    catch err do
        log("Failed to queue track: #{err}")
        res.status_code(500)
    end
end

def http_reload_handler(req, res) =
    try
        rotation.reload()
        log("rotation reloaded")
        res.status_code(200)
    catch err do
        log("Failed to reload rotation: #{err}")
        res.status_code(500)
    end
end

def http_skip_handler(req, res) =
    try
        radio.skip()
        log("skipped song on radio")
        res.status_code(200)
    catch err do
        log("Failed skip song on radio: #{err}")
        res.status_code(500)
    end
end

# Register endpoints on the server port
harbor.http.register(port=server_port_int, method="POST", "/enqueue", queue_user_track)
harbor.http.register(port=server_port_int, method="POST", "/reload", http_reload_handler)
harbor.http.register(port=server_port_int, method="POST", "/skip", http_skip_handler)