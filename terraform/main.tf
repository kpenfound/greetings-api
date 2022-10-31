terraform {
  cloud {
    organization = "kpenfound"

    workspaces {
      name = "greetings-api"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

module "fargate_task" {
  source = "github.com/kpenfound/terraform-aws-ecs-fargate-task?ref=v1.0.0"

  name = var.name
  r53zone = var.domain
  fqdn = var.fqdn
  image = var.image
}
