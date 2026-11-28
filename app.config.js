// Preserve static Expo configuration; EAS supplies the Firebase file path.
module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON?.trim();
  if (!googleServicesFile) return config;
  return {
    ...config,
    android: { ...config.android, googleServicesFile },
  };
};
