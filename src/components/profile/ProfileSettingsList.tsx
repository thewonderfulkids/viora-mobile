import {
  BellRing,
  ChevronRight,
  FileText,
  Globe2,
  Lock,
  LogOut,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

type MenuItemProps = {
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function MenuItem({ icon: Icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.menuItem, pressed && onPress ? styles.pressed : null]}
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
      <MenuItem icon={Globe2} title="Language" subtitle="English / Hindi ready" />
      <MenuItem icon={WalletCards} title="Subscription & Payments" subtitle="Plans, invoices and billing" />
      <MenuItem
        icon={BellRing}
        title="Smart Notifications"
        subtitle="Hydration, sleep, yoga and AI memory reminders"
        onPress={onNotificationsPress}
      />
      <MenuItem icon={Users} title="Family Wellness" subtitle="Add family members later" />
      <MenuItem icon={FileText} title="Reports" subtitle="Weekly and monthly reports" />
      <MenuItem icon={ShieldCheck} title="Privacy & AI Safety" subtitle="Control memory and data" />
      <MenuItem icon={Lock} title="Account Security" subtitle="Login and data protection" />

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
