class FamilyMembers < ActiveRecord::Migration[5.1]
  def change
    add_column(:family_members, :family_member_type, :string)
  end
end
