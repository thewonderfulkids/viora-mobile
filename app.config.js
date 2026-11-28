// Preserve static Expo configuration; EAS supplies the Firebase file path.
module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON?.trim();
  const plugins = [...(config.plugins || [])];
  for (const name of ['@react-native-firebase/app', '@react-native-firebase/app-check']) {
    try {
      require.resolve(name + '/app.plugin.js');
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
      continue;
    }
    if (!plugins.some(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === name)) {
      plugins.push(name);
    }
  }
  return {
    ...config,
    plugins,
    android: { ...config.android, ...(googleServicesFile ? { googleServicesFile } : {}) },
  };
};
