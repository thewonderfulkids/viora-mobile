import { router } from "expo-router";
import {
  BellRing,
  ChevronRight,
  FileText,
  Globe2,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

type MenuRoute =
  | "/language-settings"
  | "/premium"
  | "/notification-preferences"
  | "/privacy-ai-safety"
  | "/account-security"
  | "/delete-account"
  | "/family-wellness"
  | "/reports";

type MenuItemProps = {
  icon: any;
  title: string;
  subtitle: string;
  route?: MenuRoute;
  onPress?: () => void;
  disabled?: boolean;
};

function MenuItem({ icon: Icon, title, subtitle, route, onPress, disabled }: MenuItemProps) {
  const canPress = Boolean(route || onPress) && !disabled;

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }

        if (route) {
          router.push({ pathname: route as never });
        }
      }}
      disabled={!canPress}
      style={({ pressed }) => [
        styles.menuItem,
        disabled ? styles.disabledItem : null,
        pressed && canPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.menuIcon}>
        <Icon size={20} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <ChevronRight size={19} color={colors.mutedText} />
    </Pressable>
  );
}

type Props = {
  onLogout: () => void;
  onNotificationsPress?: () => void;
};

export function ProfileSettingsList({ onLogout, onNotificationsPress }: Props) {
  return (
    <View style={styles.menu}>
      <MenuItem icon={Globe2} title="Language" subtitle="English, Hindi and Hinglish preference" route="/language-settings" />
      <MenuItem icon={WalletCards} title="Subscription & Payments" subtitle="Plans, invoices and billing" route="/premium" />
      <MenuItem
        icon={BellRing}
        title="Smart Notifications"
        subtitle="Hydration, sleep, yoga, nutrition and mood reminders"
        onPress={onNotificationsPress || (() => router.push({ pathname: "/notification-preferences" as never }))}
      />
      <MenuItem icon={Users} title="Family Wellness" subtitle="Manage family members and shared wellness" route="/family-wellness" />
      <MenuItem icon={FileText} title="Reports" subtitle="Weekly, monthly and AI wellness reports" route="/reports" />
      <MenuItem icon={ShieldCheck} title="Privacy & AI Safety" subtitle="Control memory, AI and data" route="/privacy-ai-safety" />
      <MenuItem icon={Lock} title="Account Security" subtitle="Password reset and protection" route="/account-security" />
      <MenuItem icon={Trash2} title="Delete Account" subtitle="Safe deletion request" route="/delete-account" />

      <Pressable onPress={onLogout} style={styles.logoutItem}>
        <LogOut size={20} color="#B42318" />
        <View style={{ flex: 1 }}>
          <Text style={styles.logoutTitle}>Logout</Text>
          <Text style={styles.logoutText}>Sign out from this device</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    gap: spacing.md,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  disabledItem: {
    opacity: 0.68,
  },
  pressed: {
    opacity: 0.78,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  menuSubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
  logoutItem: {
    backgroundColor: "#FFF5F5",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logoutTitle: {
    color: "#B42318",
    fontSize: 15,
    fontWeight: "900",
  },
  logoutText: {
    marginTop: 3,
    color: "#B42318",
    fontSize: 12,
    fontWeight: "600",
  },
});
