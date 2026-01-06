const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withBleAdvertiserFix(config) {
    return withProjectBuildGradle(config, (config) => {
        // Check if the fix is already applied
        if (config.modResults.contents.includes('// Fix for react-native-ble-advertiser')) {
            return config;
        }

        // More aggressive fix for react-native-ble-advertiser Java 9+ compatibility
        const fixBlock = `
// Fix for react-native-ble-advertiser: ensure proper SDK version (30+) for Java 9+ compilation
// Force compileSdkVersion 36 for all subprojects to resolve Java 9+ compatibility and align with camera dependencies
subprojects { subproject ->
    subproject.afterEvaluate { project ->
        if (project.hasProperty("android") && project.android != null) {
            def android = project.android
            // Force compileSdkVersion 36 for Java 9+ compatibility
            android.compileSdkVersion 36
            android.defaultConfig {
                targetSdkVersion 36
                minSdkVersion 30
            }
            // Force build tools version
            android.buildToolsVersion "36.0.0"
        }
    }
    
    // Specific fix for react-native-ble-advertiser
    if (subproject.name == 'react-native-ble-advertiser') {
        subproject.afterEvaluate {
            android {
                compileSdkVersion 36
                defaultConfig {
                    targetSdkVersion 36
                    minSdkVersion 30
                }
                buildToolsVersion "36.0.0"
            }
        }
    }
}
`;

        // Insert BEFORE plugin applications to ensure it's evaluated first
        if (config.modResults.contents.includes('apply plugin: "expo-root-project"')) {
            config.modResults.contents = config.modResults.contents.replace(
                /(apply plugin: "expo-root-project")/,
                `${fixBlock}\n$1`
            );
        } else if (config.modResults.contents.includes('allprojects {')) {
            // Fallback: add before allprojects block
            config.modResults.contents = config.modResults.contents.replace(
                /(allprojects \{)/,
                `${fixBlock}\n$1`
            );
        } else {
            // Last resort: add at the beginning
            config.modResults.contents = fixBlock + '\n' + config.modResults.contents;
        }
        
        return config;
    });
};
