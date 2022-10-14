resource "aws_lb" "greetings" {
  name               = var.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.greetings.id]
  subnets            = data.aws_subnets.default.ids

  tags = {
    Name = var.name
  }
}

resource "aws_lb_target_group" "greetings" {
  name        = var.name
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "ip"

  health_check {
    interval          = 5
    timeout           = 3
    healthy_threshold = 2
  }
}

resource "aws_lb_listener" "greetings" {
  load_balancer_arn = aws_lb.greetings.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.greetings.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.greetings.arn
  }
}

resource "aws_acm_certificate" "greetings" {
  domain_name       = var.fqdn
  validation_method = "DNS"
}

data "aws_route53_zone" "greetings" {
  name         = var.domain
  private_zone = false
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.greetings.zone_id
  name    = var.fqdn
  type    = "CNAME"
  ttl     = 5
  records = [aws_lb.greetings.dns_name]
}

resource "aws_route53_record" "greetings" {
  for_each = {
    for dvo in aws_acm_certificate.greetings.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.greetings.zone_id
}

resource "aws_acm_certificate_validation" "greetings" {
  certificate_arn         = aws_acm_certificate.greetings.arn
  validation_record_fqdns = [for record in aws_route53_record.greetings : record.fqdn]
}

// Redirect
resource "aws_lb_listener" "redirect" {
  load_balancer_arn = aws_lb.greetings.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_security_group" "greetings" {
  name   = var.name
  vpc_id = local.vpc_id

  ingress {
    from_port = "0"
    to_port   = "0"
    protocol  = "-1"
    self      = true
  }

  ingress {
    from_port   = "80"
    to_port     = "80"
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = "443"
    to_port     = "443"
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}