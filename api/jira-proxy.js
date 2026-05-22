export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { jira_url, jira_email, jira_token, project_key, date_from } = req.body
    const auth = Buffer.from(`${jira_email}:${jira_token}`).toString('base64')
    const baseUrl = jira_url.replace(/\/$/, '')
    const jql = `project = "${project_key}" AND worklogDate >= "${date_from || '2020-01-01'}" ORDER BY updated DESC`
    const searchUrl = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,status,worklog&maxResults=100`

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(200).json({ error: data.errorMessages?.[0] || `Jira error: ${response.status}` })
    }

    const issues = data.issues || []
    let totalSeconds = 0
    const tickets = []

    for (const issue of issues) {
      const worklogs = issue.fields.worklog?.worklogs || []
      const issueSeconds = worklogs.reduce((sum, wl) => sum + (wl.timeSpentSeconds || 0), 0)
      if (issueSeconds > 0) {
        totalSeconds += issueSeconds
        tickets.push({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name || '',
          timeSpentSeconds: issueSeconds,
          timeSpentHours: Math.round((issueSeconds / 3600) * 100) / 100,
          worklogs: worklogs.map(wl => ({
            author: wl.author?.displayName || '',
            date: wl.started?.split('T')[0] || '',
            timeSpentSeconds: wl.timeSpentSeconds,
            timeSpentHours: Math.round((wl.timeSpentSeconds / 3600) * 100) / 100,
            comment: wl.comment?.content?.[0]?.content?.[0]?.text || '',
          }))
        })
      }
    }

    return res.status(200).json({
      totalSeconds,
      totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
      tickets: tickets.sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds),
      issueCount: issues.length,
    })

  } catch (err) {
    return res.status(200).json({ error: err.message })
  }
}
