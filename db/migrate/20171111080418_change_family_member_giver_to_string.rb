class ChangeFamilyMemberGiverToString < ActiveRecord::Migration[5.1]
  def change
    remove_foreign_key :gift_exchanges, column: :receiver_id
    remove_foreign_key :gift_exchanges, column: :giver_id

    rename_column :gift_exchanges, :receiver_id, :receiver_name
    rename_column :gift_exchanges, :giver_id, :giver_name

    change_column :gift_exchanges, :giver_name, :string
    change_column :gift_exchanges, :receiver_name, :string
  end
end
