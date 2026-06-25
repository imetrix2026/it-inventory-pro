const JIRA_URL = 'https://getsupport.atlassian.net'
const JIRA_EMAIL = 'tassos@metrixnet.com'
const JIRA_TOKEN = ''

export async function fetchJiraWorklogs(projectKey, dateFrom) {
  const res = await fetch('/api/jira-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jira_url: JIRA_URL,
      jira_email: JIRA_EMAIL,
      jira_token: JIRA_TOKEN,
      project_key: projectKey,
      date_from: dateFrom,
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}
