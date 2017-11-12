# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

def create_gift_exchange(data)
  GiftExchange.create(data)
end

create_gift_exchange([ { giver_name: 'Jeremy Nagel', receiver_name: 'William Fleming', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Ruby Fleming', receiver_name: 'Claire McGannon', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Elena McGannon', receiver_name: 'Jeremy Nagel', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Alice Nagel', receiver_name: 'Will GF', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Ruby\'s BF', receiver_name: 'Ash', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Matt (Elena BF)', receiver_name: 'Sandy Xu', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Matt Nagel', receiver_name: 'Ruby Fleming', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Claire McGannon', receiver_name: 'Alice Nagel', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Karen', receiver_name: 'Ruby\'s BF', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Ash', receiver_name: 'Matt Nagel', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'William Fleming', receiver_name: 'Elena McGannon', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Francesca McGannon', receiver_name: 'Karen', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Will GF', receiver_name: 'Matt (Elena BF)', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' },
  { giver_name: 'Sandy Xu', receiver_name: 'Francesca McGannon', xmas_year: '2016', giver_type: 'young adult', receiver_type: 'young adult' } ])

create_gift_exchange([ { giver_name: 'Judy McGannon', receiver_name: 'Jane Fleming', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Dan McGannon', receiver_name: 'Emily Maher', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Maryanne McGannon', receiver_name: 'Judy McGannon', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Jane Fleming', receiver_name: 'Dan McGannon', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Emily Maher', receiver_name: 'Maryanne McGannon', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Peter Nagel', receiver_name: 'Tim Fleming', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Anne Rosamilia', receiver_name: 'Peter Maher', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Dan', receiver_name: 'Peter Nagel', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Tim Fleming', receiver_name: 'Anne Rosamilia', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' },
  { giver_name: 'Peter Maher', receiver_name: 'Dan', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'old guard' } ])

create_gift_exchange([ { giver_name: 'Judy McGannon', receiver_name: 'George Fleming', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Jane Fleming', receiver_name: 'James McGannon', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Dan McGannon', receiver_name: 'Oliver Maher', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Emily Maher', receiver_name: nil, xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Peter Nagel', receiver_name: 'Xavier Fleming', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Tim Fleming', receiver_name: 'Patrick Maher', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Peter Maher', receiver_name: 'Fred Fleming', xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Anne Rosamilia', receiver_name: nil, xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Maryanne McGannon', receiver_name: nil, xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' },
  { giver_name: 'Dan', receiver_name: nil, xmas_year: '2016', giver_type: 'old guard', receiver_type: 'kid' } ])
