// src/lib/jiraService.js
// Σύνδεση με Jira Cloud API μέσω Supabase Edge Function proxy
// για να αποφύγουμε CORS issues 

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function fetchJiraWorklogs(jiraUrl, jiraEmail, apiToken, projectKey, dateFrom) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/jira-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
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
