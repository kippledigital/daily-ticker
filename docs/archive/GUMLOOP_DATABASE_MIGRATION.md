# Gumloop Database Migration Prompt

Use this prompt with Gumloop support or when reconfiguring your automation workflow.

---

## Migration Prompt for Gumloop

```
I need to update my Daily Ticker automation to:

1. REMOVE: Google Sheets integration for storing historical data
2. ADD: HTTP POST request to send daily briefs to my database
3. ADD: HTTP GET request to retrieve historical data for content improvement

Current Workflow:
- 19-node automation that generates daily stock briefs
- Currently saves to Google Sheets for historical tracking
- Runs daily at 6am

New Requirements:

## Store Daily Brief (Replace Google Sheets)

After Node 19 (Send Morning Brief via Gmail), add Node 20:

**Node 20: Store Brief in Database**
- Type: HTTP Request
- Method: POST
- URL: https://dailyticker.co/api/archive/store
- Headers:
  - Content-Type: application/json
- Body (JSON):
```json
{
  "date": "{{Current Date (YYYY-MM-DD format)}}",
  "subject": "{{Node 18: Subject Line Generator output}}",
  "htmlContent": "{{Node 17: Morning Brief HTML output}}",
  "tldr": "{{Node 16: TL;DR Brief output}}",
  "actionableCount": {{Node 14: Count of BUY + WATCH actions}},
  "stocks": {{Node 13: Stock Analysis JSON array}}
}
```

Expected Response: 201 status code with success confirmation

## Retrieve Historical Data (New Feature)

Before Node 13 (Stock Analysis), add new Node 7b:

**Node 7b: Get Historical Recommendations**
- Type: HTTP Request
- Method: GET
- URL: https://dailyticker.co/api/archive/list?limit=30
- Headers:
  - Content-Type: application/json
- Purpose: Get last 30 days of recommendations to improve content quality

Use this data in:
- Node 13: Reference past recommendations for consistency
- Node 16: Mention trending patterns ("We've recommended AAPL 3 times this month")
- Node 17: Add "Previously mentioned" context to stocks
- Node 18: Craft subject lines referencing recent winners

## Field Mappings from Current Nodes

| Current Node | Output Field | Webhook Field |
|--------------|--------------|---------------|
| Current Date | YYYY-MM-DD | date |
| Node 18: Subject Line Generator | Full subject | subject |
| Node 17: Morning Brief HTML | Complete HTML | htmlContent |
| Node 16: TL;DR Brief | Summary text | tldr |
| Node 14: Action Counter | BUY + WATCH count | actionableCount |
| Node 13: Stock Analysis | Full JSON array | stocks |

## Stock Array Format

Each stock in Node 13 must have:
- ticker (string)
- sector (string)
- confidence (number 0-100)
- riskLevel (string: "Low", "Medium", "High")
- action (string: "BUY", "WATCH", "HOLD", "AVOID")
- entryPrice (number)
- summary (string)
- whyMatters (string)
- momentumCheck (string)
- actionableInsight (string)

Optional fields:
- entryZoneLow (number)
- entryZoneHigh (number)
- allocation (string)
- cautionNotes (string)
- learningMoment (string)

## Error Handling

If POST to /api/archive/store fails:
- Log error but continue workflow
- Still send email (Node 19)
- Don't block daily brief delivery

If GET from /api/archive/list fails:
- Continue with workflow using only new data
- Don't block analysis

## Testing

Test Node 20 with sample data:
```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-27","subject":"Test","htmlContent":"<h1>Test</h1>","stocks":[{"ticker":"AAPL","sector":"Tech","confidence":85,"riskLevel":"Low","action":"HOLD","entryPrice":178.45,"summary":"Test","whyMatters":"Test","momentumCheck":"Test","actionableInsight":"Test"}]}'
```

Expected: 201 status with success message

## Questions for Gumloop Support

1. How do I add HTTP Request nodes between existing nodes?
2. Can I parse the JSON response from GET /api/archive/list to use in later nodes?
3. How do I handle API errors gracefully without stopping the workflow?
4. Can I access historical data fields in my prompts (e.g., "stocks from last 30 days")?
5. How do I remove the Google Sheets integration cleanly?

## Benefits After Migration

- Single source of truth for historical data
- Faster access to past recommendations
- Automatic archive website updates
- Foundation for performance analytics
- Eliminates Google Sheets maintenance
```

---

## Simplified Version (If Above Is Too Complex)

If you prefer a simpler migration in two phases:

### Phase 1: Just Add Database Storage (Keep Google Sheets)

```
Add Node 20 after Gmail send:

Type: HTTP POST
URL: https://dailyticker.co/api/archive/store
Body: {
  "date": "{{today YYYY-MM-DD}}",
  "subject": "{{subject line}}",
  "htmlContent": "{{morning brief HTML}}",
  "stocks": {{stock analysis JSON}}
}

This saves briefs to my website archive automatically.
Keep Google Sheets for now as backup.
```

### Phase 2: Add Historical Data Retrieval (Later)

```
Add Node 7b before stock analysis:

Type: HTTP GET
URL: https://dailyticker.co/api/archive/list?limit=30

Use response to improve recommendations by:
- Referencing past mentions of same stocks
- Noting trending sectors
- Highlighting winning calls
```

---

## Timeline

**Week 1:** Add database storage (Node 20) - Keep Google Sheets
**Week 2:** Test archive website is updating correctly
**Week 3:** Add historical data retrieval (Node 7b)
**Week 4:** Remove Google Sheets integration

This gradual approach ensures no data loss during migration.

---

## Support

If Gumloop needs more details:
- **API Documentation:** See docs/GUMLOOP_WEBHOOK.md
- **Test Endpoint:** https://dailyticker.co/api/archive/store
- **Verify Archive:** https://dailyticker.co/archive
- **Contact:** brief@dailyticker.co
