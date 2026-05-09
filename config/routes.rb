Rails.application.routes.draw do

  get 'contact', to: 'contacts#new', as: 'contact'
  post 'contact', to: 'contacts#create'

  get 'about', to: 'pages#about'

  root to: 'pages#home'
end
