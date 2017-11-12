Rails.application.routes.draw do
  resources :gift_exchanges
  resources :family_members

  root to: 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
