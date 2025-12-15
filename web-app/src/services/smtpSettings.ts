import { callSalesboxApi } from './salesboxApi'

export interface SmtpSettings {
  appSmtpHost: string | null
  appSmtpPort: number
  appSmtpUser: string | null
  appSmtpPass: string | null
  appSmtpSecure: 'No' | 'TLS' | 'SSL'
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const response = await callSalesboxApi<SmtpSettings>('/mcp/smtp-settings', {
    method: 'GET',
  })

  if (response.error) {
    throw new Error(response.error)
  }

  return (
    response.data || {
      appSmtpHost: null,
      appSmtpPort: 25,
      appSmtpUser: null,
      appSmtpPass: null,
      appSmtpSecure: 'No',
    }
  )
}

export async function saveSmtpSettings(
  settings: Partial<SmtpSettings>
): Promise<SmtpSettings> {
  const response = await callSalesboxApi<SmtpSettings>('/mcp/smtp-settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  })

  if (response.error) {
    throw new Error(response.error)
  }

  return (
    response.data || {
      appSmtpHost: null,
      appSmtpPort: 25,
      appSmtpUser: null,
      appSmtpPass: null,
      appSmtpSecure: 'No',
    }
  )
}
