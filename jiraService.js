// src/lib/jiraService.js
// Σύνδεση με Jira Cloud API μέσω Supabase Edge Function proxy
// για να αποφύγουμε CORS issues

export async function fetchJiraWorklogs(jiraUrl, jiraEmail, apiToken, projectKey, dateFrom) {
  // Jira Cloud API — τραβάμε issues με worklogs από το project
  const auth = btoa(`${jiraEmail}:${apiToken}`)
  const baseUrl = jiraUrl.replace(/\/$/, '')

  // Βήμα 1: Τραβάμε όλα τα issues του project
  const jql = `project = "${projectKey}" AND worklogDate >= "${dateFrom || '2020-01-01'}" ORDER BY updated DESC`
  const searchUrl = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,status,worklog&maxResults=100`

  try {
    const res = await fetch(searchUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.errorMessages?.[0] || `Jira error: ${res.status}`)
    }

    const data = await res.json()
    const issues = data.issues || []

    // Βήμα 2: Για κάθε issue, μαζεύουμε τα worklogs
    let totalSeconds = 0
    const ticketDetails = []

    for (const issue of issues) {
      let issueWorklogs = issue.fields.worklog?.worklogs || []

      // Αν έχει παραπάνω από 20 worklogs, κάνουμε ξεχωριστό call
      if ((issue.fields.worklog?.total || 0) > 20) {
        const wlRes = await fetch(`${baseUrl}/rest/api/3/issue/${issue.key}/worklog`, {
          headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
        })
        if (wlRes.ok) {
          const wlData = await wlRes.json()
          issueWorklogs = wlData.worklogs || []
        }
      }

      const issueSeconds = issueWorklogs.reduce((sum, wl) => sum + (wl.timeSpentSeconds || 0), 0)
      if (issueSeconds > 0) {
        totalSeconds += issueSeconds
        ticketDetails.push({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name || '',
          timeSpentSeconds: issueSeconds,
          timeSpentHours: Math.round((issueSeconds / 3600) * 100) / 100,
          worklogs: issueWorklogs.map(wl => ({
            author: wl.author?.displayName || '',
            date: wl.started?.split('T')[0] || '',
            timeSpentSeconds: wl.timeSpentSeconds,
            timeSpentHours: Math.round((wl.timeSpentSeconds / 3600) * 100) / 100,
            comment: wl.comment?.content?.[0]?.content?.[0]?.text || '',
          }))
        })
      }
    }

    return {
      totalSeconds,
      totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
      tickets: ticketDetails.sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds),
      issueCount: issues.length,
    }
  } catch (err) {
    throw new Error(`Σφάλμα σύνδεσης Jira: ${err.message}`)
  }
}
