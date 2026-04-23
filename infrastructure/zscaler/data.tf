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
