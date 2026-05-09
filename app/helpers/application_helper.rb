module ApplicationHelper
  def nav_link_classes(path)
    base = 'rounded-lg px-3 py-2 text-sm font-semibold text-brand-teal no-underline decoration-transparent transition-colors hover:bg-brand-surface hover:text-brand-sky hover:no-underline'
    active = ' ring-2 ring-inset ring-brand-gold/90 bg-brand-surface'
    current_page?(path) ? "#{base}#{active}" : base
  end

  def mobile_nav_link_classes(path)
    base = 'rounded-lg px-3 py-3 text-base font-semibold text-brand-teal no-underline decoration-transparent hover:bg-brand-surface hover:no-underline'
    active = ' bg-brand-surface ring-1 ring-brand-teal/15'
    current_page?(path) ? "#{base}#{active}" : base
  end

  FLASH_CLASSES = {
    'notice' => 'border-emerald-200 bg-emerald-50 text-emerald-950',
    'success' => 'border-emerald-200 bg-emerald-50 text-emerald-950',
    'alert' => 'border-red-200 bg-red-50 text-red-950',
    'error' => 'border-red-200 bg-red-50 text-red-950'
  }.freeze

  def flash_container_classes(name)
    FLASH_CLASSES[name.to_s] || 'border-slate-200 bg-white text-slate-900'
  end

  def ga4_measurement_id
    AppConfig.fetch(:ga4_measurement_id, env_key: 'GA_MEASUREMENT_ID', default: nil).presence
  end
end
