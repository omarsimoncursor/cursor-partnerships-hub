#!/usr/bin/env bash
set -euo pipefail

# Resets the Zscaler demo IaC files to their original (under-conditioned) state.
# Run this after merging a real fix PR to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
TF_DIR="$REPO_ROOT/infrastructure/zscaler"

mkdir -p "$TF_DIR"

cat > "$TF_DIR/versions.tf" << 'VERSIONSEOF'
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    zpa = {
      source  = "zscaler/zpa"
      version = "~> 4.4"
    }
  }
}

provider "zpa" {
  zpa_cloud = "PRODUCTION"
}
VERSIONSEOF

cat > "$TF_DIR/data.tf" << 'DATAEOF'
data "zpa_idp_controller" "okta_prod" {
  name = "okta-prod"
}

data "zpa_scim_groups" "security_admin" {
  name     = "security-admin"
  idp_name = "okta-prod"
}

data "zpa_scim_groups" "compliance_officer" {
  name     = "compliance-officer"
  idp_name = "okta-prod"
}

data "zpa_posture_profile" "managed_compliant" {
  name = "managed-compliant-corp"
}

data "zpa_trusted_network" "corp_egress" {
  name = "corp-egress"
}
DATAEOF

cat > "$TF_DIR/workforce-admin.tf" << 'TFEOF'
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
TFEOF

cd "$REPO_ROOT"
git add "$TF_DIR/versions.tf" "$TF_DIR/data.tf" "$TF_DIR/workforce-admin.tf"
git commit -m "chore: reset zscaler demo IaC for next run"
echo ""
echo "Demo bug reset. Push to main to redeploy:"
echo "  git push origin main"
