export { buildAIContext } from "./aiContextComposer";
export type {
    AIProvider,
    AIProviderName,
    AIProviderRequest,
    AIProviderResponse
} from "./AIProvider";
export { aiService } from "./AIService";
export type { AICoachMode } from "./aiTypes";
export {
    getAIConversationMessagesByConversationId,
    getAIConversationThreads, getLatestAIConversationMessages, saveConversation
} from "./conversationService";

export type {
    AIConversationMessage,
    AIConversationThread
} from "./conversationService";

export type {
    WellnessFocusArea,
    WellnessInsight,
    WellnessIntelligence,
    WellnessIntelligenceDashboard,
    WellnessLearningStatistic,
    WellnessMetricSnapshot,
    WellnessRecommendation,
    WellnessRiskSignal,
    WellnessStatus,
    WellnessTimelineEvent,
    WellnessTrend
} from "../../types/wellnessIntelligence";
export { AIError, normalizeAIError } from "./aiErrors";
export type { AIErrorCode } from "./aiErrors";
export { saveAIRequestLog } from "./aiRequestLogService";
export { processConversationSummary } from "./conversationSummaryService";
export { buildAIMemoryContext } from "./memoryContextBuilder";
export { getAIMemoryDashboard } from "./memoryDashboardService";
export type { AIMemoryContext } from "./memoryContextBuilder";
export { extractMemoriesFromConversation } from "./memoryExtractor";
export { processConversationMemory } from "./memoryIntelligenceService";
export {
    calculateMemoryRank,
    rankMemories
} from "./memoryRanking";
export { calculateReinforcedConfidence } from "./memoryScoring";
export {
    createAIMemory, createConversationSummary, findExistingMemory, getActiveAIMemories, getLatestConversationSummaries,
    getWellnessProfile, markMemoryUsed, reinforceMemory, upsertWellnessProfile
} from "./memoryService";
export { buildWellnessPrompt } from "./promptBuilder";
export { generateWellnessAdvice } from "./remoteAIService";
export { runManagedAIRequest } from "./requestManager";
export { VioraCloudAIProvider } from "./VioraCloudAIProvider";
export { buildWellnessIntelligence, buildWellnessIntelligenceDashboard } from "./wellnessIntelligenceService";
export { buildWellnessTimeline } from "./wellnessTrendService";

export type {
    WellnessMetricTrend, WellnessTimeline,
    WellnessTimelineItem
} from "../../types/wellnessTimeline";

export { getAICoachConversation, getAICoachLatestHistory, getAICoachThreads, saveAICoachMessage } from "../../repositories/aiCoachRepository";
export { buildAICoachContextBundle, buildAICoachFollowUps, buildAICoachQuickActions } from "./coachContextService";
export { buildContextAwareCoachPrompt } from "./coachPromptBuilder";
export { describeAICoachTone, resolveAICoachTone } from "./coachToneService";
export { askContextAwareWellnessCoach, getCurrentAICoachContext } from "./contextAwareCoachService";

export type {
    GoalDoc,
    GoalHabitDashboard,
    GoalInsight,
    GoalPrediction,
    GoalSuggestion,
    HabitDoc
} from "../../types/goalsHabits";
export { getGoalHabitDashboard } from "../goalsHabits";
