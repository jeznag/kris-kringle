class AddColumnAccountId < ActiveRecord::Migration[5.1]
  def change
    add_column(:gift_exchanges, :account_id, :integer)
    add_column(:family_members, :account_id, :integer)
  end
end
