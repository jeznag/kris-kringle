class ChangeParentIdToString < ActiveRecord::Migration[5.1]
  def change
    change_column :family_members, :parent_id, :string
  end
end
