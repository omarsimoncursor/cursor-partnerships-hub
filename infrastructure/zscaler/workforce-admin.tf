###############################################################################
# Connector and segment grouping
###############################################################################
resource "zpa_segment_group" "internal_tools" {
  name        = "Internal Tools"
  description = "Private applications owned by Platform Security"
  enabled     = true
}

resource "zpa_app_connector_group" "us_east_corp" {
  name                     = "us-east-corp-connectors"
  description              = "Corporate connector group for workforce admin services"
  enabled                  = true
  city_country             = "Ashburn, VA"
  country_code             = "US"
  latitude                 = "39.0438"
  longitude                = "-77.4874"
  location                 = "Ashburn, VA, US"
  upgrade_day              = "SUNDAY"
  upgrade_time_in_secs     = "66600"
  override_version_profile = true
  version_profile_id       = 0
  dns_query_type           = "IPV4"
}

resource "zpa_server_group" "workforce_admin" {
  name              = "workforce-admin-prod"
  description       = "Server group backing the Workforce Admin application"
  enabled           = true
  dynamic_discovery = true

  app_connector_groups {
    id = [zpa_app_connector_group.us_east_corp.id]
  }
}

###############################################################################
# Application segment: Workforce Admin (audit logs)
###############################################################################
resource "zpa_application_segment" "workforce_admin_audit_logs" {
  name             = "workforce-admin-audit-logs"
  description      = "Internal audit log app for the Workforce Admin tool"
  enabled          = true
  health_reporting = "ON_ACCESS"
  bypass_type      = "NEVER"
  is_cname_enabled = true
  tcp_port_ranges  = ["443", "443"]
  domain_names     = ["workforce-admin.corp.cursor-demos.internal"]
  segment_group_id = zpa_segment_group.internal_tools.id

  server_groups {
    id = [zpa_server_group.workforce_admin.id]
  }

  depends_on = [
    zpa_server_group.workforce_admin,
    zpa_segment_group.internal_tools,
  ]
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
