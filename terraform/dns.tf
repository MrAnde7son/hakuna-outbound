resource "cloudflare_record" "outbound" {
  zone_id = var.cloudflare_zone_id
  name    = var.hostname
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  ttl     = 1
  proxied = false
}
