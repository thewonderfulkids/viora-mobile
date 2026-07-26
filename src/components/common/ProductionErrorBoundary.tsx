import { router } from "expo-router";
import { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logClientError } from "../../services/support";
import { colors, radius, spacing } from "../../theme";

type ProductionErrorBoundaryProps = {
  children: ReactNode;
};

type ProductionErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

function ErrorFallback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Viora recovered safely</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app hit an unexpected issue, but your wellness data is safe. Try again or return to Dashboard.
        </Text>
        <Text style={styles.errorText}>{message}</Text>

        <View style={styles.actions}>
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Retry</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Go Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export class ProductionErrorBoundary extends Component<ProductionErrorBoundaryProps, ProductionErrorBoundaryState> {
  state: ProductionErrorBoundaryState = {
    hasError: false,
    message: "Unexpected app error",
  };

  static getDerivedStateFromError(error: Error): ProductionErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Unexpected app error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logClientError({
      source: "error_boundary",
      message: error?.message || "Unexpected app error",
      stack: error?.stack || null,
      componentStack: info.componentStack || null,
      route: null,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "Unexpected app error" });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.message} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryButton: {
    flexGrow: 1,
    alignItems: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  primaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryButton: {
    flexGrow: 1,
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
  },
});
