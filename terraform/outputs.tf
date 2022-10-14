output "ecr_repo" {
  value       = aws_ecr_repository.greetings.repository_url
  description = "ECR URL"
}