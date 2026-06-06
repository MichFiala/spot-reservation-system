#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./release.sh <version>"
    echo "Example: ./release.sh 1.0.12"
    exit 1
fi

VERSION="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm run build

echo "Copying to wwwroot..."
WWWROOT="$SCRIPT_DIR/backend/src/SpotReservation.Api/wwwroot"
rm -rf "$WWWROOT"
cp -r dist "$WWWROOT"

echo "Publishing Docker image..."
cd "$SCRIPT_DIR"
dotnet publish ./backend/src/SpotReservation.Api --os linux --arch x64 /p:PublishProfile=DefaultContainer


echo "Pushing Docker image..."
docker tag michfiala/tenspot-application:latest michfiala/tenspot-application:$VERSION
docker push michfiala/tenspot-application:$VERSION
docker push michfiala/tenspot-application:latest

echo "Done. Published as michfiala/tenspot-application:$VERSION"