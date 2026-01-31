#!/bin/bash

# Recreate the config file
echo "window.__RUNTIME_CONFIG__ = {" > /usr/share/nginx/html/env-config.js

# Read environment variables and inject them
# Note: we check if the variable exists to avoid printing "undefined" or empty strings if not needed,
# though explicit undefined is safer if the frontend logic expects it.

if [ -n "$VITE_APP_ID" ]; then
  echo "  VITE_APP_ID: \"$VITE_APP_ID\"," >> /usr/share/nginx/html/env-config.js
fi

if [ -n "$VITE_APP_FUNCTIONS_VERSION" ]; then
  echo "  VITE_APP_FUNCTIONS_VERSION: \"$VITE_APP_FUNCTIONS_VERSION\"," >> /usr/share/nginx/html/env-config.js
fi

if [ -n "$VITE_APP_BASE_URL" ]; then
  echo "  VITE_APP_BASE_URL: \"$VITE_APP_BASE_URL\"," >> /usr/share/nginx/html/env-config.js
fi

echo "};" >> /usr/share/nginx/html/env-config.js

# No need to exec nginx, the parent entrypoint does it.
