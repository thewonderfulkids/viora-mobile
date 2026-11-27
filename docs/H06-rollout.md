# H06 rollout gates
- Keep V I O R A cleanup disabled (VIORA_ENABLE_AVATAR_CLEANUP unset) until private avatar reads and managed publication are validated on real Android devices, including old clients and two-device conflicts.
- Opt in individual profiles only via trusted internal migration after verification. Never accept a client-supplied verification boolean as proof.
- Scheduled worker processes ten managed profiles per day with a durable cursor. Review locked profiles after failures; never reclaim a lock based solely on age. Use recoverStoppedAvatarCleanup only after independently confirming the previous invocation and outstanding storage operations have terminated.
- Verify maintenanceState is denied to all client writes before enabling.
- Account deletion discovery is read-only; destructive account deletion remains disabled until its independent execution gates pass.
- Run functions build, avatar regressions, emulator rules tests and native device checks before activation.
