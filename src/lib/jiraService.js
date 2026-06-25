export async function fetchJiraWorklogs(projectKey, dateFrom) {
  const res = await fetch('/api/jira-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_key: projectKey,
      date_from: dateFrom,
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}
