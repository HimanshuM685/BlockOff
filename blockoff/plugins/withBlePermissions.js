const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withBlePermissions(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    manifest.manifest["uses-permission"] =
      manifest.manifest["uses-permission"] || [];

    // Core permissions for Android 10/11 compatibility
    const perms = [
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_ADVERTISE",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      // Android 10+ specific permissions
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      // Android 11+ specific permissions
      "android.permission.QUERY_ALL_PACKAGES"
    ];

    // Add features for better compatibility
    manifest.manifest["uses-feature"] = manifest.manifest["uses-feature"] || [];
    const features = [
      { $: { "android:name": "android.hardware.bluetooth_le", "android:required": "false" } },
      { $: { "android:name": "android.hardware.bluetooth", "android:required": "false" } },
      { $: { "android:name": "android.hardware.location.gps", "android:required": "false" } },
      { $: { "android:name": "android.hardware.location.network", "android:required": "false" } }
    ];

    const existing = new Set(
      (manifest.manifest["uses-permission"] || []).map(
        (p) => p.$["android:name"]
      )
    );

    const existingFeatures = new Set(
      (manifest.manifest["uses-feature"] || []).map(
        (f) => f.$["android:name"]
      )
    );

    perms.forEach((p) => {
      if (!existing.has(p)) {
        manifest.manifest["uses-permission"].push({ $: { "android:name": p } });
      }
    });

    features.forEach((f) => {
      if (!existingFeatures.has(f.$["android:name"])) {
        manifest.manifest["uses-feature"].push(f);
      }
    });

    return config;
  });
};
