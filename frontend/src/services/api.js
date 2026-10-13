
const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api/leads/'

export async function getLeads() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }

  return response.json()
}

export async function getLeadStats() {
  const response = await fetch(`${API_URL}stats/`)

  if (!response.ok) {
    throw new Error('Failed to fetch lead statistics')
  }

  return response.json()
}

export async function createLead(lead) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })

  if (!response.ok) {
    throw new Error('Failed to create lead')
  }

  return response.json()
}

export async function deleteDuplicates() {
  const response = await fetch(`${API_URL}remove-duplicates/`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to remove duplicates')
  }

  return response.json()
}

export function exportLeads() {
  window.open(`${API_URL}export/`, '_blank')
}
