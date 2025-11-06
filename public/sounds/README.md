# Ambient Sound Files

This directory contains ambient sound files for the Launchpad onboarding experience.

## Required File

- `ambient.mp3` - Ambient background sound for the Initiation Sequence

## How to Add

1. Place your `ambient.mp3` file in this directory
2. Recommended format:
   - Format: MP3
   - Bitrate: 128-192 kbps
   - Duration: Loopable (or long enough for extended use)
   - Volume: Moderate (will be controlled by user toggle)

## Sound Suggestions

The ambient sound should be:
- Atmospheric and space-like (mission control theme)
- Non-distracting background ambience
- Suitable for looping
- Professional quality

## Usage

The sound is used in `/app/onboarding/page.tsx` and is controlled by the user via the "Sound ON/OFF" toggle in the Mission Control interface.

## Alternative

If you don't have an ambient sound file, the onboarding will still work perfectly - the sound toggle will simply have no effect until the file is added.
