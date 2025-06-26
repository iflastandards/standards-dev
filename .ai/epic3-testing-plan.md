# Epic 3 Production Testing Plan - Detailed Implementation

## Overview
Epic 3 (CSV ⇆ Google Sheet Integration) testing plan to achieve production readiness. This plan incorporates realistic scale limits, existing validation components, DCTAP profiles, and complete workflow testing including UI and CI integration.

## Current Status
- **Epic 3.1** (Google Service Account): ✅ Functionally complete, 65% test coverage
- **Epic 3.2** (sheet-sync CLI): ✅ Functionally complete, 35% test coverage  
- **Epic 3.3** (Configuration): ✅ Functionally complete, 25% test coverage
- **Epic 3.4** (GitHub Actions): ❌ Not started
- **Epic 3.5** (Portal Integration): 🟡 25% complete

## Testing Implementation Checklist

### Phase 1: Validation Infrastructure Refactoring (Priority: HIGH)
- [ ] Create validation hook from VocabularyTable components
  - [ ] Extract csvValidation.ts logic into reusable hook
  - [ ] Extract profileValidation.ts logic
  - [ ] Create unified useCSVValidation hook
- [ ] Create DCTAP profile loader
  - [ ] Load concepts_langmap_profile.csv
  - [ ] Load element_langmap_profile.csv
  - [ ] Implement profile caching
  - [ ] Support standard-specific profile subsets

### Phase 2: Test Fixture Organization (Priority: HIGH)
- [ ] Copy ISBDM test fixtures to central location
  - [ ] Copy CSV test files (sensory-specification*.csv)
  - [ ] Copy DCTAP profiles
  - [ ] Copy JSON-LD contexts
- [ ] Create test data generator
  - [ ] Support up to 5000 rows (revised from original plan)
  - [ ] Generate data based on DCTAP profiles
  - [ ] Include error scenarios option

### Phase 3: Configuration Validation Testing (Priority: HIGH)
- [ ] Sheet configuration validation tests
  - [ ] JSON schema validation
  - [ ] Sheet URL format validation
  - [ ] Missing configuration handling
  - [ ] Environment variable precedence
- [ ] DCTAP profile validation
  - [ ] Validate configs against profiles
  - [ ] Detect profile mismatches

### Phase 4: Realistic Scale Testing (Priority: HIGH)
- [ ] Performance tests with realistic data volumes
  - [ ] 2000 row CSV processing (normal size)
  - [ ] 5000 row CSV processing (maximum expected)
  - [ ] Memory usage profiling (<100MB increase)
  - [ ] Processing time benchmarks (<15s for 5000 rows)

### Phase 5: Complete Workflow Testing (Priority: HIGH)
- [ ] Portal UI integration tests
  - [ ] UI button triggers sheet sync
  - [ ] Real-time progress display
  - [ ] Error message display
  - [ ] Success confirmation
- [ ] GitHub Actions workflow
  - [ ] Test pull operation
  - [ ] Validate pulled data
  - [ ] Test push operation
  - [ ] Automated sync on CSV changes
- [ ] GitHub Codespace configuration
  - [ ] Auto-setup on codespace creation
  - [ ] Secrets management
  - [ ] Developer tools installation

### Phase 6: CSV Processing with DCTAP Validation (Priority: HIGH)
- [ ] DCTAP-based CSV validation
  - [ ] Validate against concepts profile
  - [ ] Validate against elements profile
  - [ ] Detect mandatory property violations
  - [ ] Validate repeatable properties
  - [ ] Language consistency checking

### Phase 7: Error Recovery and Edge Cases (Priority: MEDIUM)
- [ ] Network error handling
  - [ ] API quota exceeded scenarios
  - [ ] Network timeout recovery
  - [ ] Partial sync failure handling
- [ ] Data integrity tests
  - [ ] Concurrent modification detection
  - [ ] Data loss prevention
  - [ ] Rollback mechanisms

### Phase 8: Integration with Existing Test Infrastructure
- [ ] Update pre-commit hooks
  - [ ] Add Epic 3 quick validation tests
  - [ ] Ensure fast feedback (<30s)
- [ ] Update GitHub Actions matrix
  - [ ] Add epic3-csv test suite
  - [ ] Add epic3-sync test suite
  - [ ] Add epic3-ui test suite
- [ ] Update documentation
  - [ ] Update TESTING.md
  - [ ] Update developer notes
  - [ ] Create Epic 3 testing guide

## Implementation Details

### 1. Validation Hook Structure
```typescript
// /packages/theme/src/hooks/useCSVValidation.ts
export function useCSVValidation(dctapProfile?: string) {
  const profile = useDCTAPProfile(dctapProfile || 'concepts_langmap_profile.csv');
  
  const validateHeaders = (headers: string[]) => {...};
  const validateData = (data: CSVConceptRow[]) => {...};
  const validateAgainstProfile = (data: any[], profile: DCTAPProfile) => {...};
  
  return { validateHeaders, validateData, validateAgainstProfile };
}
```

### 2. Test Data Generator
```typescript
// /packages/theme/src/tests/utils/testDataGenerator.ts
export function generateTestCSV(config: {
  rows: number;        // Max 5000 as per requirement
  languages: string[];
  includeErrors?: boolean;
  profile: 'concepts' | 'elements';
}) {
  // Generate realistic test data based on DCTAP profiles
}
```

### 3. Realistic Scale Expectations
- Normal dataset: ~2000 rows
- Maximum dataset: 5000 rows
- Processing time: <5s for 2000 rows, <15s for 5000 rows
- Memory usage: <100MB increase for maximum dataset

### 4. Complete Workflow Coverage
1. **User Interface**: Portal management page with sync buttons
2. **CLI Tool**: sheet-sync commands (pull, push, status, list)
3. **Google Sheets API**: Bidirectional sync with error handling
4. **Validation**: DCTAP profile compliance checking
5. **CI/CD**: Automated testing and deployment

## Files to Create

### New Test Files (10 files)
1. `/packages/theme/src/hooks/useCSVValidation.ts`
2. `/packages/theme/src/utils/dctapProfileLoader.ts`
3. `/packages/theme/src/tests/utils/testDataGenerator.ts`
4. `/tools/sheet-sync/tests/config-validation.test.ts`
5. `/tools/sheet-sync/tests/csv-dctap-validation.test.ts`
6. `/tools/sheet-sync/tests/performance/realistic-scale.test.ts`
7. `/tools/sheet-sync/tests/integration/error-recovery.test.ts`
8. `/portal/src/tests/integration/sheet-sync-workflow.test.ts`
9. `/.github/workflows/test-sheet-sync.yml`
10. `/.devcontainer/devcontainer.json`

### Test Fixture Organization
- Source: `/standards/ISBDM/static/data/`
- Destination: `/packages/theme/src/tests/fixtures/epic3/`

## Success Criteria

1. **Test Coverage**
   - Epic 3.1: 90%+ (from 65%)
   - Epic 3.2: 85%+ (from 35%)
   - Epic 3.3: 90%+ (from 25%)

2. **Performance Metrics**
   - 2000 rows: <5 seconds processing time
   - 5000 rows: <15 seconds processing time
   - Memory usage: <100MB increase

3. **Workflow Validation**
   - End-to-end UI → CLI → Sheets flow works
   - All error scenarios handled gracefully
   - CI/CD pipeline fully automated

4. **Developer Experience**
   - Codespace setup works automatically
   - Pre-commit hooks provide fast feedback
   - Clear error messages and recovery suggestions

## Implementation Timeline

### Week 1: Infrastructure and Core Tests
- Day 1: Extract validation hook from VocabularyTable
- Day 2: Organize test fixtures and create generators
- Day 3: Configuration and DCTAP validation tests
- Day 4: Realistic scale tests
- Day 5: CSV processing with DCTAP validation

### Week 2: Workflow and Integration
- Day 1-2: Complete workflow testing - UI integration
- Day 3: GitHub Actions and Codespace setup
- Day 4: Error recovery and edge cases
- Day 5: Integration with existing infrastructure

## Notes
- Scale tests adjusted to realistic expectations (max 5000 rows)
- Leverages existing VocabularyTable validation components
- Uses DCTAP profiles as validation baseline
- Includes complete workflow from UI to sheets
- After testing completion, refinements will be identified and implemented