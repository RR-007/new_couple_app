const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude web-only packages from native (Android/iOS) bundles
// These packages depend on DOM APIs (window, document) and crash on native
config.resolver = {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
        // Block leaflet on native platforms
        if (
            platform !== 'web' &&
            (moduleName === 'leaflet' || moduleName === 'react-leaflet' || moduleName.startsWith('leaflet/') || moduleName.startsWith('react-leaflet/'))
        ) {
            return {
                type: 'empty',
            };
        }
        // Fall back to default resolution
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = withNativeWind(config, { input: "./global.css" });
