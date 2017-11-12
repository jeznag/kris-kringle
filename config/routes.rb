Rails.application.routes.draw do
  resources :accounts
  resources :gift_exchanges
  resources :family_members

  get 'kris_kringle', to: 'kris_kringle#kris_kringle'

  root to: 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
