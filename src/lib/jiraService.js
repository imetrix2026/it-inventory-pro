export async function fetchJiraWorklogs(jiraUrl, jiraEmail, apiToken, projectKey, dateFrom) {
  const res = await fetch('/api/jira-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jira_url: jiraUrl,
      jira_email: jiraEmail,
      jira_token: apiToken,
      project_key: projectKey,
      date_from: dateFrom,
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}
