# Testing iOS Safari Silent Mode Audio Playback

## Overview
This document provides instructions for manually testing the iOS Safari audio playback functionality when the device is in silent mode (ringer switch is off).

## What Was Changed
The audio playback implementation was updated from using Web Audio API's `AudioBufferSourceNode` to using HTML5 `<audio>` elements with the `playsinline` attribute. This change allows audio to play on iOS Safari even when the device's ringer switch is set to silent mode.

### Technical Details
- **Previous Implementation**: Used `AudioContext.createBufferSource()` which respects iOS silent mode
- **New Implementation**: Uses HTML5 `Audio()` elements with `playsinline` and `webkit-playsinline` attributes
- **Visualization**: Still uses Web Audio API's `AnalyserNode` connected via `MediaElementSourceNode`

## Manual Testing Steps

### Prerequisites
- iOS device (iPhone or iPad)
- Safari browser
- Access to the deployed choir performance feature

### Test Case 1: Audio in Silent Mode
1. **Setup**:
   - Set your iOS device to silent mode (flip the ringer switch so you see the orange indicator)
   - Open Safari on your iOS device
   - Navigate to the choir performance page

2. **Test Steps**:
   - Tap "Enable Audio" when prompted (this is required for user gesture)
   - Join a performance or start one if you're the leader
   - Wait for or trigger the PLAYING state
   
3. **Expected Result**:
   - ✅ Audio should play through the speakers even with the device in silent mode
   - ✅ Visualization should animate showing the audio is playing
   - ✅ Your assigned voice part (Soprano, Alto, Tenor, or Bass) should be audible

4. **Actual Result**: [To be filled during testing]

### Test Case 2: Audio in Normal Mode
1. **Setup**:
   - Set your iOS device to normal mode (flip the ringer switch so orange is NOT visible)
   - Open Safari on your iOS device
   - Navigate to the choir performance page

2. **Test Steps**:
   - Tap "Enable Audio" when prompted
   - Join a performance or start one if you're the leader
   - Wait for or trigger the PLAYING state
   
3. **Expected Result**:
   - ✅ Audio should play through the speakers
   - ✅ Visualization should animate
   - ✅ Your assigned voice part should be audible

4. **Actual Result**: [To be filled during testing]

### Test Case 3: Multiple Playbacks
1. **Setup**:
   - iOS device in silent mode
   - Safari on the choir performance page

2. **Test Steps**:
   - Complete one full performance cycle (READY → PLAYING → FINISHED)
   - Reset the performance
   - Start another performance

3. **Expected Result**:
   - ✅ Second performance should also play audio correctly
   - ✅ No audio artifacts or overlapping from previous playback
   - ✅ Visualization works on second playback

4. **Actual Result**: [To be filled during testing]

### Test Case 4: Voice Part Switching
1. **Setup**:
   - iOS device in silent mode
   - Safari on the choir performance page

2. **Test Steps**:
   - Join as one voice part (e.g., Soprano)
   - Note the audio played
   - Reset and join as a different voice part (e.g., Bass)
   - Start playing again

3. **Expected Result**:
   - ✅ Different audio file plays for different voice parts
   - ✅ Audio plays in silent mode for all voice parts

4. **Actual Result**: [To be filled during testing]

## Troubleshooting

### If audio doesn't play:
1. Verify you tapped "Enable Audio" - this user gesture is required by browsers
2. Check browser console for errors
3. Ensure audio files are accessible at `/assets/audio/{S,A,T,B}.mp3`
4. Try refreshing the page and enabling audio again

### If visualization doesn't work:
1. This might indicate the audio isn't actually playing
2. Check if MediaElementSourceNode connection succeeded
3. Review browser console for Web Audio API errors

## Automated Tests
The following automated tests have been added and pass:
- `AudioService` creates HTML5 audio elements with correct attributes
- `AudioService` schedules playback using HTML5 Audio elements
- `AudioService` stops audio playback correctly
- `AudioService` emits started/ended events appropriately
- All existing `Choir` component tests continue to pass

Run tests with:
```bash
npm test -- --include='**/audio.service.spec.ts' --watch=false --browsers=ChromeHeadless
npm test -- --include='**/choir.spec.ts' --watch=false --browsers=ChromeHeadless
```

## Notes for Developers
- The `playsinline` attribute is critical for iOS to respect audio playback
- User gesture (tap/click) is still required to enable audio initially
- The Web Audio API context is maintained for visualization purposes
- `MediaElementSourceNode` connects HTML5 audio to the analyser node
- Error handling allows fallback when MediaElementSourceNode connection fails
