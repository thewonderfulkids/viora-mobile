import { RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View, Pressable } from "react-native";
import { Activity, BadgeCheck, Clapperboard, Music2, Settings2, UsersRound } from "lucide-react-native";

import { useAuth } from "../context/AuthContext";
import { AdminMediaPreviewCard, AdminMediaUploadPanel, ContentStudioWorkflowCard, ExactContentMappingPanel } from "../components/adminMedia";
import { CommonBackButton, ErrorState, LoadingState, PrimaryButton, Screen } from "../components/common";
import { useAdminControl } from "../hooks";
import { colors, radius, spacing } from "../theme";
import { AdminContentCategory, AdminContentKind, PremiumPlanCode } from "../types";
import { PREMIUM_PLANS } from "../services/premium";

const contentKinds: AdminContentKind[] = ["video", "music", "program", "tip", "announcement"];
const categories: AdminContentCategory[] = ["home_workout", "yoga", "weight_loss", "music", "meditation", "sleep", "dashboard", "general"];
const levels = ["beginner", "intermediate", "advanced", "all"] as const;
const mediaTypes = ["video", "audio", "mixed", "none"] as const;

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}><Icon size={18} color={colors.primary} /></View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Chip<T extends string>({ value, active, onPress }: { value: T; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{value.replace(/_/g, " ")}</Text>
    </Pressable>
  );
}

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const admin = useAdminControl();

  if (!isAdmin || !admin.isAdmin) {
    return (
      <Screen>
        <ErrorState title="Admin access required" message="This page is available only to verified Viora administrators." />
      </Screen>
    );
  }

  if (admin.loading && !admin.state) {
    return (
      <Screen>
        <LoadingState message="Loading Viora admin control panel..." />
      </Screen>
    );
  }

  if (!admin.state) {
    return (
      <Screen>
        <ErrorState title="Admin panel unavailable" message={admin.error || "Please try again."} onRetry={admin.refresh} />
      </Screen>
    );
  }

  const config = admin.state.appConfig;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={admin.loading} onRefresh={admin.refresh} />}
      >
        <CommonBackButton label="Settings" fallbackPath="/settings-center" />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Viora Beta Control</Text>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage users, exact content mapping, Firebase videos, audio, programs and publishing from one in-app studio.</Text>
        </View>

        {admin.error ? <Text style={styles.errorText}>{admin.error}</Text> : null}
        {admin.message ? <Text style={styles.successText}>{admin.message}</Text> : null}

        <View style={styles.statsGrid}>
          <StatCard icon={UsersRound} label="Users" value={admin.state.stats.users} />
          <StatCard icon={BadgeCheck} label="Subscriptions" value={admin.state.stats.subscriptions} />
          <StatCard icon={Activity} label="Feedback" value={admin.state.stats.betaFeedback} />
          <StatCard icon={Clapperboard} label="Active Content" value={admin.state.stats.activeMedia} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings2 size={20} color={colors.primary} />
            <View>
              <Text style={styles.sectionTitle}>App Config & Feature Flags</Text>
              <Text style={styles.sectionSubtitle}>Use these flags during beta. Razorpay can disable premium bypass later.</Text>
            </View>
          </View>

          {[
            ["betaMode", "Beta mode"],
            ["premiumBypassEnabled", "Premium bypass"],
            ["appTourEnabled", "First-run app tour"],
            ["musicEnabled", "Music module"],
            ["videoProgramsEnabled", "Video programs"],
            ["maintenanceMode", "Maintenance mode"],
          ].map(([key, label]) => (
            <View key={key} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{label}</Text>
              <Switch
                value={Boolean((config as any)[key])}
                onValueChange={(value) => admin.updateConfig({ ...config, [key]: value })}
                disabled={admin.saving}
              />
            </View>
          ))}

          <Text style={styles.label}>Maintenance message</Text>
          <TextInput
            value={config.maintenanceMessage}
            onChangeText={(maintenanceMessage) => admin.updateConfig({ ...config, maintenanceMessage })}
            placeholder="Maintenance message"
            placeholderTextColor={colors.mutedText}
            multiline
            style={[styles.input, styles.multilineInput]}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UsersRound size={20} color={colors.primary} />
            <View>
              <Text style={styles.sectionTitle}>Users & Subscription Control</Text>
              <Text style={styles.sectionSubtitle}>Search by email or mobile, disable beta access, or grant any Viora plan.</Text>
            </View>
          </View>

          <TextInput
            value={admin.userSearch}
            onChangeText={admin.setUserSearch}
            placeholder="user@email.com or mobile number"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            style={styles.input}
          />
          <PrimaryButton title={admin.saving ? "Searching..." : "Search User"} onPress={admin.searchUsers} disabled={admin.saving} />

          {admin.users.map((user) => (
            <Pressable key={user.uid} onPress={() => admin.setSelectedUser(user)} style={[styles.userCard, admin.selectedUser?.uid === user.uid ? styles.userCardSelected : null]}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userMeta}>{user.email || "No email"}</Text>
              {user.mobile ? <Text style={styles.userMeta}>Mobile: {user.mobile}</Text> : null}
              <Text style={styles.userMeta}>Status: {user.isDisabled ? "Disabled" : "Active"}</Text>
              <View style={styles.rowWrap}>
                <PrimaryButton title={user.isDisabled ? "Enable" : "Disable"} onPress={() => admin.toggleUserDisabled(user)} disabled={admin.saving} />
              </View>
            </Pressable>
          ))}

          {admin.selectedUser ? (
            <View style={styles.planBox}>
              <Text style={styles.label}>Selected user plan</Text>
              <View style={styles.rowWrap}>
                {PREMIUM_PLANS.map((plan) => (
                  <Chip
                    key={plan.code}
                    value={plan.code as PremiumPlanCode}
                    active={admin.selectedPlanCode === plan.code}
                    onPress={() => admin.setSelectedPlanCode(plan.code)}
                  />
                ))}
              </View>
              <PrimaryButton title={admin.saving ? "Applying..." : "Apply Selected Plan"} onPress={admin.applyPlan} disabled={admin.saving} />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clapperboard size={20} color={colors.primary} />
            <View>
              <Text style={styles.sectionTitle}>Content Studio</Text>
              <Text style={styles.sectionSubtitle}>Upload Firebase videos, audio and thumbnails, then publish them without shipping a fresh APK.</Text>
            </View>
          </View>

          <ContentStudioWorkflowCard />

          <Text style={styles.label}>Content type</Text>
          <View style={styles.rowWrap}>
            {contentKinds.map((kind) => <Chip key={kind} value={kind} active={admin.contentDraft.kind === kind} onPress={() => admin.setContentDraft({ ...admin.contentDraft, kind })} />)}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.rowWrap}>
            {categories.map((category) => <Chip key={category} value={category} active={admin.contentDraft.category === category} onPress={() => admin.setContentDraft({ ...admin.contentDraft, category })} />)}
          </View>

          <Text style={styles.label}>Level</Text>
          <View style={styles.rowWrap}>
            {levels.map((level) => <Chip key={level} value={level} active={admin.contentDraft.level === level} onPress={() => admin.setContentDraft({ ...admin.contentDraft, level })} />)}
          </View>

          <TextInput value={admin.contentDraft.title} onChangeText={(title) => admin.setContentDraft({ ...admin.contentDraft, title })} placeholder="Title" placeholderTextColor={colors.mutedText} style={styles.input} />
          <TextInput value={admin.contentDraft.subtitle} onChangeText={(subtitle) => admin.setContentDraft({ ...admin.contentDraft, subtitle })} placeholder="Short description" placeholderTextColor={colors.mutedText} style={styles.input} />
          <AdminMediaUploadPanel
            draft={admin.contentDraft}
            disabled={admin.saving}
            onChange={admin.setContentDraft}
          />

          <ExactContentMappingPanel
            draft={admin.contentDraft}
            onChange={admin.setContentDraft}
          />

          <AdminMediaPreviewCard
            draft={admin.contentDraft}
          />

          <TextInput value={admin.contentDraft.url} onChangeText={(url) => admin.setContentDraft({ ...admin.contentDraft, url })} placeholder="Uploaded Firebase URL or optional external URL" placeholderTextColor={colors.mutedText} autoCapitalize="none" style={styles.input} />
          <TextInput value={admin.contentDraft.thumbnailUrl} onChangeText={(thumbnailUrl) => admin.setContentDraft({ ...admin.contentDraft, thumbnailUrl })} placeholder="Thumbnail URL optional" placeholderTextColor={colors.mutedText} autoCapitalize="none" style={styles.input} />

          <Text style={styles.label}>Media type</Text>
          <View style={styles.rowWrap}>
            {mediaTypes.map((mediaType) => <Chip key={mediaType} value={mediaType} active={admin.contentDraft.mediaType === mediaType} onPress={() => admin.setContentDraft({ ...admin.contentDraft, mediaType })} />)}
          </View>

          <TextInput value={admin.contentDraft.instructor || ""} onChangeText={(instructor) => admin.setContentDraft({ ...admin.contentDraft, instructor })} placeholder="Instructor / Coach name" placeholderTextColor={colors.mutedText} style={styles.input} />
          <TextInput value={(admin.contentDraft.equipment || []).join(", ")} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, equipment: value.split(/,|\n/).map((item) => item.trim()).filter(Boolean) })} placeholder="Equipment comma separated" placeholderTextColor={colors.mutedText} style={styles.input} />
          <TextInput value={(admin.contentDraft.benefits || []).join(", ")} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, benefits: value.split(/,|\n/).map((item) => item.trim()).filter(Boolean) })} placeholder="Benefits comma separated" placeholderTextColor={colors.mutedText} style={styles.input} />
          <TextInput value={(admin.contentDraft.steps || []).join("\n")} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, steps: value.split(/\n|,/).map((item) => item.trim()).filter(Boolean) })} placeholder="Steps / exercise list, one per line" placeholderTextColor={colors.mutedText} multiline style={[styles.input, styles.multilineInput]} />

          <View style={styles.twoColumn}>
            <TextInput value={String(admin.contentDraft.durationMinutes)} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, durationMinutes: Number(value.replace(/\D/g, "") || 0) })} placeholder="Minutes" placeholderTextColor={colors.mutedText} keyboardType="number-pad" style={[styles.input, styles.halfInput]} />
            <TextInput value={String(admin.contentDraft.caloriesEstimate || 0)} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, caloriesEstimate: Number(value.replace(/\D/g, "") || 0) })} placeholder="Calories" placeholderTextColor={colors.mutedText} keyboardType="number-pad" style={[styles.input, styles.halfInput]} />
          </View>

          <View style={styles.twoColumn}>
            <TextInput value={String(admin.contentDraft.sortOrder)} onChangeText={(value) => admin.setContentDraft({ ...admin.contentDraft, sortOrder: Number(value.replace(/\D/g, "") || 100) })} placeholder="Order" placeholderTextColor={colors.mutedText} keyboardType="number-pad" style={[styles.input, styles.halfInput]} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Premium content</Text>
            <Switch value={admin.contentDraft.isPremium} onValueChange={(isPremium) => admin.setContentDraft({ ...admin.contentDraft, isPremium })} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Active</Text>
            <Switch value={admin.contentDraft.isActive} onValueChange={(isActive) => admin.setContentDraft({ ...admin.contentDraft, isActive })} />
          </View>

          <PrimaryButton title={admin.saving ? "Saving..." : "Save Content"} onPress={admin.saveContent} disabled={admin.saving} />

          <View style={styles.contentList}>
            {admin.state.content.map((item) => (
              <View key={item.id} style={styles.contentCard}>
                <View style={styles.contentCardHeader}>
                  <View style={styles.contentIcon}>{item.kind === "music" ? <Music2 size={16} color={colors.primary} /> : <Clapperboard size={16} color={colors.primary} />}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    <Text style={styles.contentMeta}>{item.kind} â€¢ {item.category} â€¢ {item.targetId || "unmapped"} â€¢ {item.mediaRole || "generic"} â€¢ {item.durationMinutes} min</Text>
                  </View>
                </View>
                <Text style={styles.contentSubtitle}>{item.subtitle || item.url || "No description"}</Text>
                <View style={styles.actionRow}>
                  <Pressable onPress={() => admin.editContent(item)} style={styles.smallButton}><Text style={styles.smallButtonText}>Edit</Text></Pressable>
                  <Pressable onPress={() => admin.toggleContent(item)} style={[styles.smallButton, item.isActive ? styles.dangerButton : null]}><Text style={[styles.smallButtonText, item.isActive ? styles.dangerButtonText : null]}>{item.isActive ? "Disable" : "Enable"}</Text></Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: 32, paddingBottom: 56, gap: spacing.xl },
  hero: { borderRadius: radius.xxl, padding: spacing.xl, backgroundColor: colors.softGreen, borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.primaryDark, fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { marginTop: spacing.xs, color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: "900" },
  subtitle: { marginTop: spacing.sm, color: colors.mutedText, fontSize: 14, lineHeight: 21, fontWeight: "700" },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: "900" },
  successText: { color: colors.primaryDark, fontSize: 13, fontWeight: "900" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statCard: { width: "47%", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: spacing.lg },
  statIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen },
  statValue: { marginTop: spacing.md, color: colors.text, fontSize: 24, fontWeight: "900" },
  statLabel: { color: colors.mutedText, fontSize: 12, fontWeight: "800" },
  section: { borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: spacing.xl, gap: spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { marginTop: 2, color: colors.mutedText, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  toggleRow: { minHeight: 48, borderRadius: radius.lg, backgroundColor: colors.background, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "900" },
  label: { color: colors.text, fontSize: 13, fontWeight: "900" },
  input: { minHeight: 48, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: spacing.md, color: colors.text, fontSize: 14, fontWeight: "700" },
  multilineInput: { minHeight: 80, paddingTop: spacing.md, textAlignVertical: "top" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 11, fontWeight: "900", textTransform: "capitalize" },
  chipTextActive: { color: colors.white },
  userCard: { borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: spacing.lg, gap: 3 },
  userCardSelected: { borderColor: colors.primary, backgroundColor: colors.softGreen },
  userName: { color: colors.text, fontSize: 16, fontWeight: "900" },
  userMeta: { color: colors.mutedText, fontSize: 12, fontWeight: "700" },
  planBox: { gap: spacing.md, borderRadius: radius.xl, backgroundColor: colors.softGreen, padding: spacing.lg },
  twoColumn: { flexDirection: "row", gap: spacing.md },
  halfInput: { flex: 1 },
  contentList: { gap: spacing.md },
  contentCard: { borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.sm },
  contentCardHeader: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  contentIcon: { width: 36, height: 36, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.softGreen },
  contentTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  contentMeta: { color: colors.mutedText, fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  contentSubtitle: { color: colors.mutedText, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  smallButton: { borderRadius: radius.pill, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  smallButtonText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  dangerButton: { backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FECDD3" },
  dangerButtonText: { color: colors.danger },
});
