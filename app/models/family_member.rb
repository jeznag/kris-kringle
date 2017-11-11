class FamilyMember < ApplicationRecord
  has_many :gift_exchanges

  def parent
    FamilyMember.where(id: self.parent_id)
  end

  def children
    FamilyMember.where(parent_id: self.id)
  end
end
