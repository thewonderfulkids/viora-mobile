import { ReceiptText } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PaymentRecord } from "../../types/premium";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function BillingHistoryList({ payments }: { payments: PaymentRecord[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Billing History</Text>
      {payments.length === 0 ? (
        <Text style={styles.empty}>No billing records yet. Your first successful purchase will appear here.</Text>
      ) : (
        <View style={styles.list}>
          {payments.map((payment) => (
            <View key={payment.id} style={styles.row}>
              <View style={styles.iconShell}>
                <ReceiptText size={18} color={colors.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.plan}>{payment.planCode.replaceAll("_", " ")}</Text>
                <Text style={styles.meta}>{formatDate(payment.createdAt)} · {payment.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.amount}>₹{payment.amountInr.toLocaleString("en-IN")}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  empty: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  copy: {
    flex: 1,
  },
  plan: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  meta: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
  amount: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
});
