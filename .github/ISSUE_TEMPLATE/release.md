---
name: Release checklist
about: When releasing a new version, go through this checklist first.
title: '🔖Release X.Y.Z (checklist)'
labels: release
assignees:
  - @lucasmetzen

---

- [ ] Re-check module functionality in
    - [ ] v14
    - [ ] v13
    - [ ] v12
- [ ] Draft [new release](https://github.com/lucasmetzen/foundryvtt-messenger/releases/new) with `X.Y.Z` as tag and title, and generate release notes as basis.
- [ ] Update CHANGELOG with proper release notes
    - [ ] Copy those back to the release draft
- [ ] Update README
- [ ] Commit CHANGELOG and README using subject: `🔖Release X.Y.Z`
    - [ ] Merge to `main`
- [ ] Publish release
- [ ] Verify new release on [Foundry's package page](https://foundryvtt.com/packages/lame-messenger)