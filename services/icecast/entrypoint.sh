#!/bin/sh

# Exit immediately if any command inside the script fails
set -e

echo "Verifying streaming configuration variables..."

# Enforce required environment variables. Will crash container if any are blank/missing.
: "${ICECAST_SOURCE_PASSWORD:?\"ERROR: ICECAST_SOURCE_PASSWORD environment variable is not set!\"}"
: "${ICECAST_RELAY_PASSWORD:?\"ERROR: ICECAST_RELAY_PASSWORD environment variable is not set!\"}"
: "${ICECAST_ADMIN_PASSWORD:?\"ERROR: ICECAST_ADMIN_PASSWORD environment variable is not set!\"}"
: "${ICECAST_PORT:?\"ERROR: ICECAST_PORT environment variable is not set!\"}"

# Sensible fallback defaults for non-sensitive data if they aren't provided
ICECAST_ADMIN_USERNAME="${ICECAST_ADMIN_USERNAME:-admin}"
ICECAST_ADMIN_EMAIL="${ICECAST_ADMIN_EMAIL:-icemaster@localhost}"
ICECAST_LOCATION="${ICECAST_LOCATION:-Earth}"
ICECAST_HOSTNAME="${ICECAST_HOSTNAME:-localhost}"
ICECAST_MAX_CLIENTS="${ICECAST_MAX_CLIENTS:-100}"
ICECAST_MAX_SOURCES="${ICECAST_MAX_SOURCES:-2}"

echo "All required configurations found. Updating /etc/icecast2/icecast.xml..."

# Create a blank temporary file in an unmounted directory
touch /tmp/icecast.xml.tmp

# Copy the original contents into the temporary file
cat /etc/icecast.xml > /tmp/icecast.xml.tmp

# Safely update the XML configurations using strict regex matches
sed -i "s|<port>[^<]*</port>|<port>${ICECAST_PORT}</port>|g" /tmp/icecast.xml.tmp
sed -i "s|<source-password>[^<]*</source-password>|<source-password>${ICECAST_SOURCE_PASSWORD}</source-password>|g" /tmp/icecast.xml.tmp
sed -i "s|<relay-password>[^<]*</relay-password>|<relay-password>${ICECAST_RELAY_PASSWORD}</relay-password>|g" /tmp/icecast.xml.tmp
sed -i "s|<admin-password>[^<]*</admin-password>|<admin-password>${ICECAST_ADMIN_PASSWORD}</admin-password>|g" /tmp/icecast.xml.tmp
sed -i "s|<admin-user>[^<]*</admin-user>|<admin-user>${ICECAST_ADMIN_USERNAME}</admin-user>|g" /tmp/icecast.xml.tmp
sed -i "s|<admin>[^<]*</admin>|<admin>${ICECAST_ADMIN_EMAIL}</admin>|g" /tmp/icecast.xml.tmp
sed -i "s|<location>[^<]*</location>|<location>${ICECAST_LOCATION}</location>|g" /tmp/icecast.xml.tmp
sed -i "s|<hostname>[^<]*</hostname>|<hostname>${ICECAST_HOSTNAME}</hostname>|g" /tmp/icecast.xml.tmp
sed -i "s|<clients>[^<]*</clients>|<clients>${ICECAST_MAX_CLIENTS}</clients>|g" /tmp/icecast.xml.tmp
sed -i "s|<sources>[^<]*</sources>|<sources>${ICECAST_MAX_SOURCES}</sources>|g" /tmp/icecast.xml.tmp


cat /tmp/icecast.xml.tmp > /etc/icecast.xml
rm /tmp/icecast.xml.tmp

echo "Icecast configuration fully materialized."

# Hand execution over to the original container execution target
exec "$@"