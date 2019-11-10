class AddAccountId < ActiveRecord::Migration[5.1]
  def up
    change_column :accounts, :id, :int, null: false, unique: true, auto_increment: true
    change_column :gift_exchanges, :id, :int, null: false, unique: true, auto_increment: true
    change_column :family_members, :id, :int, null: false, unique: true, auto_increment: true
  end
end
