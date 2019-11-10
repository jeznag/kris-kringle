class StartIndexAt1000 < ActiveRecord::Migration[5.1]
  def up
    change_table :accounts, :options => "AUTO_INCREMENT = 1000"
    change_table :gift_exchanges, :options => "AUTO_INCREMENT = 1000"
    change_table :family_members, :options => "AUTO_INCREMENT = 1000"
  end
end
