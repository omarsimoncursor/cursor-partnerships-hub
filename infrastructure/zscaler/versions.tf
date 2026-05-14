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
