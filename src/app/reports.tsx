import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { FileChartColumnIncreasing } from "lucide-react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { PremiumJourneyHero } from "../components/premiumExperience";
import {
  ReportCenterHero,
  ReportExportCard,
  ReportExportHistory,
  ReportInsightList,
  ReportMetricGrid,
  ReportOptionList,
  ReportRangeTabs,
  ReportSection,
  ReportTrendChart,
} from "../components/reports";
import { useReports } from "../hooks";
import { colors, spacing } from "../theme";

export default function ReportsScreen() {
  const {
    dashboard,
    selectedRange,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    changeRange,
    saveCurrentReport,
    exportCurrentReport,
    openSavedExport,
  } = useReports();

  if (loading && !dashboard) {
    return (
      <Screen>
        <LoadingState message="Building your health report center..." />
      </Screen>
    );
  }

  if (error && !dashboard) {
    return (
      <Screen>
        <ErrorState title="Unable to load reports" message={error} onRetry={refresh} />
      </Screen>
    );
  }

  if (!dashboard) {
    return (
      <Screen>
        <ErrorState title="Reports unavailable" message="Please try again." onRetry={refresh} />
      </Screen>
    );
  }

  const activeReport = dashboard.activeReport;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(selectedRange)} />}
      >
        <CommonBackButton label="Progress" fallbackPath="/(tabs)/progress" />
        <PremiumJourneyHero
          eyebrow="Health Reports"
          title="Your wellness story, clearly explained."
          subtitle="Turn daily signals into readable trends, AI highlights and doctor-friendly report snapshots you can save or export."
          icon={<FileChartColumnIncreasing size={29} color="#1D4ED8" />}
          colors={["#172554", "#1D4ED8", "#60A5FA"]}
          chips={["Trends", "Risk flags", "PDF export", "Doctor friendly"]}
        />

        <ReportCenterHero
          score={dashboard.heroScore}
          summary={dashboard.heroSummary}
          activePlanCode={dashboard.activePlanCode}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <ReportRangeTabs value={selectedRange} onChange={changeRange} />

        <ReportSection
          title="Report Library"
          subtitle="Free users get daily reports. Weekly, monthly and doctor-friendly reports unlock through Viora Plus, Pro and Elite Family."
        >
          <ReportOptionList
            options={dashboard.reportOptions}
            onSelectRange={changeRange}
            onUpgrade={() => router.push({ pathname: "/premium" as never })}
          />
        </ReportSection>

        <ReportSection title={activeReport.title} subtitle={activeReport.subtitle}>
          <ReportMetricGrid metrics={activeReport.sections[0]?.metrics || []} />
        </ReportSection>

        <ReportSection title="AI Highlights & Risk Flags" subtitle={activeReport.aiSummary}>
          <ReportInsightList report={activeReport} />
        </ReportSection>

        {activeReport.sections.slice(1).map((section) => (
          <ReportSection key={section.id} title={section.title} subtitle={section.summary}>
            <ReportMetricGrid metrics={section.metrics} />
            <ReportTrendChart points={section.trend} />
          </ReportSection>
        ))}

        <ReportSection title="Doctor-friendly Format" subtitle={dashboard.doctorFriendlyNote}>
          <ReportExportCard
            canExport={dashboard.access.exportPdf}
            saving={saving}
            onSave={() => saveCurrentReport(activeReport)}
            onExport={() => exportCurrentReport(activeReport)}
          />
        </ReportSection>

        <ReportSection title="Export History" subtitle="Saved PDF-ready report snapshots stay connected to your account.">
          <ReportExportHistory exports={dashboard.exports} onOpenExport={openSavedExport} />
        </ReportSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 170,
    gap: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
});
