class ChangeAccountIdToString < ActiveRecord::Migration[5.1]
  def change
    change_column :gift_exchanges, :account_id, :string
    change_column :family_members, :account_id, :string
  end
end
