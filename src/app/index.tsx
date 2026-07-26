import { Redirect } from "expo-router";
import { useState } from "react";

import { LaunchExperience } from "../components/launch/LaunchExperience";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, userDoc, loading } = useAuth();
  const [launchComplete, setLaunchComplete] = useState(false);

  if (!launchComplete || loading) {
    return <LaunchExperience onComplete={() => setLaunchComplete(true)} />;
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  if (userDoc?.onboardingCompleted === true) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
