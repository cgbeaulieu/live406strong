# Content Security Policy for 406 Strong.
# - Google Fonts (CSS + WOFF2) needs fonts.googleapis.com (style) and fonts.gstatic.com (font).
# - Google Analytics 4 (GA4) needs googletagmanager.com (script + connect) and google-analytics.com (img + connect).
# - Inline JSON-LD <script type="application/ld+json"> blocks are allow-listed via a per-request nonce
#   PLUS application/ld+json being treated as data, not executable JS, by browsers.
# - Inline <script> in _analytics.html.erb gets the same nonce.
# Tightening further (no inline at all) would require moving GA bootstrap into a Stimulus controller.

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.base_uri    :self
    policy.font_src    :self, :data, 'https://fonts.gstatic.com'
    policy.img_src     :self, :data, :https
    policy.object_src  :none
    policy.script_src  :self, 'https://www.googletagmanager.com'
    policy.style_src   :self, 'https://fonts.googleapis.com'
    policy.connect_src :self,
                       'https://www.google-analytics.com',
                       'https://*.analytics.google.com',
                       'https://*.googletagmanager.com'
    policy.frame_ancestors :self
    policy.form_action :self
  end

  config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w[script-src style-src]
  config.content_security_policy_report_only = false
end
