class FamilyMember < ActiveRecord::Migration[5.1]
  def change
    add_column(:family_members, :parent_id, :integer)
    add_foreign_key :family_members, :family_member, column: :parent_id
  end
end
