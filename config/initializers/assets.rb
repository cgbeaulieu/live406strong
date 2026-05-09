# Be explicit about extra asset pipeline entries beyond manifest.js.
Rails.application.config.assets.precompile += %w[
  tailwind.css
  *.svg
  *.gif
  *.png
  *.ico
  *.jpg
  *.jpeg
  *.JPG
]
