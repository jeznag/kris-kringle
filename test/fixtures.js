// Rows shaped like GET /family_members.json. Three branches under the family root, so the
// old guard heads are siblings, their children are cousins, and partners are in-laws.
const FAMILY_MEMBERS = [
  { id: 1, name: 'Judy McGannon', partner: 'Peter Nagel', family_member_type: 'old guard', parent_id: null },
  { id: 2, name: 'Jeremy Nagel', partner: 'Sandy Xu', family_member_type: 'young adult', parent_id: '1' },
  { id: 3, name: 'Sean', partner: '', family_member_type: 'kid', parent_id: '2' },
  { id: 4, name: 'Alice Nagel', partner: 'Krste Sekulovski', family_member_type: 'young adult', parent_id: '1' },
  { id: 5, name: 'Julijan', partner: '', family_member_type: 'kid', parent_id: '4' },
  { id: 6, name: 'Matthew Nagel', partner: 'Karen Ceballos', family_member_type: 'young adult', parent_id: '1' },
  { id: 7, name: 'Jane Fleming', partner: 'Tim Fleming', family_member_type: 'old guard', parent_id: null },
  { id: 8, name: 'Ruby Fleming', partner: 'Dale', family_member_type: 'young adult', parent_id: '7' },
  { id: 9, name: 'Maisie', partner: '', family_member_type: 'kid', parent_id: '8' },
  { id: 10, name: 'William Fleming', partner: '', family_member_type: 'young adult', parent_id: '7' },
  { id: 11, name: 'Fred Fleming', partner: 'Grace', family_member_type: 'young adult', parent_id: '7' },
  { id: 12, name: 'Dan McGannon', partner: 'Anna Rosamilia', family_member_type: 'old guard', parent_id: null },
  { id: 13, name: 'Claire McGannon', partner: 'Ash', family_member_type: 'young adult', parent_id: '12' },
  { id: 14, name: 'Elio', partner: '', family_member_type: 'kid', parent_id: '13' },
  { id: 15, name: 'Elena McGannon', partner: 'Tilly', family_member_type: 'young adult', parent_id: '12' },
  { id: 16, name: 'Maryanne McGannon', partner: 'Dan Riordan', family_member_type: 'old guard', parent_id: null },
  { id: 17, name: 'Emily Maher', partner: 'Pete Maher', family_member_type: 'old guard', parent_id: null },
  { id: 18, name: 'Patrick Maher', partner: '', family_member_type: 'kid', parent_id: '17' },
  { id: 19, name: 'Mateo Nagel', partner: '', family_member_type: 'kid', parent_id: '6', participating_this_year: 'false' },
].map((member) => ({ participating_this_year: 'true', ...member }));

module.exports = { FAMILY_MEMBERS };
