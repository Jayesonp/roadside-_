# Google Maps Setup Guide

This guide will help you set up Google Maps integration for the Roadside Assistance Technician Dashboard.

## Prerequisites

- Google Cloud Platform account
- Expo CLI installed
- React Native development environment set up

## Step 1: Get Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for enhanced location search)

4. Create API credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Create separate keys for iOS and Android (recommended for security)

## Step 2: Configure API Keys

### Option A: Using app.json (Current Setup)
1. Open `app.json`
2. Replace the placeholder values:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_ACTUAL_IOS_API_KEY"
     }
   },
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_ANDROID_API_KEY"
       }
     }
   }
   ```

### Option B: Using Environment Variables (Recommended)
1. Copy `.env.example` to `.env`
2. Add your API keys to `.env`
3. Update `app.json` to use environment variables:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY_IOS}"
     }
   }
   ```

## Step 3: Rebuild the App

After adding API keys, you need to rebuild the app:

```bash
# For iOS
expo run:ios

# For Android
expo run:android

# Or build for production
expo build:ios
expo build:android
```

## Step 4: Test Maps Functionality

1. Start your development server: `expo start`
2. Navigate to the "Maps Test" tab in the app
3. Test the following features:
   - Map display with current location
   - Location markers
   - Navigation to selected destinations
   - Permission handling

## Features Implemented

### MapComponent
- **Current Location**: Shows user's current position
- **Destination Markers**: Displays job locations with custom markers
- **Navigation Integration**: Opens Google Maps/Apple Maps for turn-by-turn directions
- **Permission Handling**: Requests and manages location permissions
- **Fallback Support**: Works without API keys using device default maps

### Technician Dashboard Integration
- **Job Details Map**: Shows customer location in job details modal
- **Enhanced Navigation**: Improved navigation with coordinates support
- **Real-time Updates**: Maps update with new job locations

### Test Page Features
- **Sample Locations**: Pre-configured test locations in Georgetown, Guyana
- **Interactive Testing**: Select destinations and test navigation
- **Permission Testing**: Test location permission flow
- **API Key Validation**: Verify Google Maps integration

## Troubleshooting

### Maps Not Loading
- Verify API keys are correct
- Check that required APIs are enabled in Google Cloud Console
- Ensure app has been rebuilt after adding API keys
- Check device/simulator location permissions

### Navigation Not Working
- Verify Google Maps or Apple Maps is installed
- Check that coordinates are valid
- Test with different navigation apps

### Permission Issues
- Grant location permissions when prompted
- Check device location services are enabled
- Test on physical device (simulators may have limitations)

## API Key Security

### Best Practices
1. **Restrict API Keys**: Add application restrictions in Google Cloud Console
2. **Separate Keys**: Use different keys for development and production
3. **Environment Variables**: Store keys in environment variables, not in code
4. **Regular Rotation**: Rotate API keys periodically

### Restrictions to Add
- **Android**: Add your app's package name and SHA-1 fingerprint
- **iOS**: Add your app's bundle identifier
- **HTTP Referrers**: Restrict to your domains for web usage

## Cost Management

Google Maps API usage is charged based on requests:
- **Map Loads**: $7 per 1,000 requests
- **Directions**: $5 per 1,000 requests
- **Places**: $17 per 1,000 requests

### Free Tier
- $200 monthly credit (covers ~28,500 map loads)
- Monitor usage in Google Cloud Console

## Testing Locations

The app includes test locations in Georgetown, Guyana:
1. **Georgetown City Center** (6.8013, -58.1551)
2. **Stabroek Market** (6.8077, -58.1578)
3. **University of Guyana** (6.8045, -58.1432)
4. **Cheddi Jagan International Airport** (6.7834, -58.1234)

## Support

For issues with:
- **Google Maps API**: Check [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- **Expo Integration**: See [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- **React Native Maps**: Visit [React Native Maps GitHub](https://github.com/react-native-maps/react-native-maps)

## Next Steps

1. Set up API keys following this guide
2. Test maps functionality using the test page
3. Customize map styling and markers as needed
4. Implement additional features like route optimization
5. Add offline map support for areas with poor connectivity
