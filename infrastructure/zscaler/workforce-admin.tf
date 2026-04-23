###############################################################################
# Application segment: Workforce Admin (audit logs)
###############################################################################
resource "zpa_application_segment" "workforce_admin_audit_logs" {
  name              = "workforce-admin-audit-logs"
  description       = "Internal audit log app for the Workforce Admin tool"
  enabled           = true
  health_reporting  = "ON_ACCESS"
  bypass_type       = "NEVER"
  is_cname_enabled  = true
  tcp_port_ranges   = ["443", "443"]
  domain_names      = ["workforce-admin.corp.cursor-demos.internal"]
  segment_group_id  = "internal-tools"
  server_groups     = ["sg-workforce-admin"]
}

###############################################################################
# Access policy rule
#
# WARNING: this rule grants ALLOW with no SCIM_GROUP, POSTURE, TRUSTED_NETWORK,
# or CLIENT_TYPE conditions. Any authenticated user, on any device, from any
# network, with any client, can reach the audit log.
#
# This was widened in commit b7c91d2 ("wip: open audit logs for QA") and never
# narrowed back down. ZPA risk evt-21794 fired when scope vs intent measured
# 4,287 users in scope vs the least-privilege intent of 18.
###############################################################################
resource "zpa_policy_access_rule" "workforce_admin_audit_logs_allow" {
  name        = "workforce-admin-audit-logs-allow"
  description = "Allow access to the Workforce Admin audit log"
  action      = "ALLOW"
  operator    = "AND"

  conditions {
    operator = "OR"
    operands {
      object_type = "APP"
      lhs         = "id"
      rhs         = zpa_application_segment.workforce_admin_audit_logs.id
    }
  }
}
