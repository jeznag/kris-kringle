class AddAccountId < ActiveRecord::Migration[5.1]
  def up
    change_column :accounts, :id, :primary_key
    change_column :gift_exchanges, :id, :primary_key
    change_column :family_members, :id, :primary_key
  end
end
