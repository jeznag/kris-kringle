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

Account.create([{"id":1,"account_name":"McGannon","account_id":"LSo6Hua9SqSJmz256DaqMm8f","created_at":"2017-11-12T08:11:31.236Z","updated_at":"2017-11-12T08:11:31.236Z","email": "jeremymnagel@gmail.com"}])

FamilyMember.create([{"id":1,"name":"Jeremy Nagel","partner":"Sandy Xu","created_at":"2017-11-11T04:57:52.792Z","updated_at":"2017-11-13T20:16:54.947Z","family_member_type":"young adult","parent_id":"2","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":2,"name":"Judy McGannon","partner":"Peter Nagel","created_at":"2017-11-11T05:50:11.743Z","updated_at":"2017-11-13T20:16:54.955Z","family_member_type":"old guard","parent_id":nil,"account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":3,"name":"Alice Nagel","partner":"","created_at":"2017-11-11T06:03:28.720Z","updated_at":"2017-11-13T20:31:33.049Z","family_member_type":"young adult","parent_id":"2","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"f"},{"id":4,"name":"Matthew Nagel","partner":"Karen","created_at":"2017-11-11T06:08:28.633Z","updated_at":"2017-11-13T20:16:54.966Z","family_member_type":"young adult","parent_id":"2","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":5,"name":"Jane Fleming","partner":"Tim Fleming","created_at":"2017-11-11T06:08:42.286Z","updated_at":"2017-11-13T20:16:54.971Z","family_member_type":"old guard","parent_id":nil,"account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":6,"name":"William Fleming","partner":"Will's GF","created_at":"2017-11-11T06:08:57.791Z","updated_at":"2017-11-13T20:16:54.979Z","family_member_type":"young adult","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":7,"name":"Ruby Fleming","partner":"Ruby's BF","created_at":"2017-11-11T06:09:11.288Z","updated_at":"2017-11-13T20:16:54.984Z","family_member_type":"young adult","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":8,"name":"Henry Fleming","partner":"","created_at":"2017-11-11T06:09:27.078Z","updated_at":"2017-11-13T20:46:15.867Z","family_member_type":"young adult","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":9,"name":"George Fleming","partner":"","created_at":"2017-11-11T06:09:43.087Z","updated_at":"2017-11-13T20:16:54.993Z","family_member_type":"kid","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":10,"name":"Fred Fleming","partner":"","created_at":"2017-11-11T06:09:54.980Z","updated_at":"2017-11-13T20:16:54.998Z","family_member_type":"kid","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":11,"name":"Xavier Fleming","partner":"","created_at":"2017-11-11T06:10:08.393Z","updated_at":"2017-11-13T20:16:55.001Z","family_member_type":"kid","parent_id":"5","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":12,"name":"Maryanne","partner":"Dan","created_at":"2017-11-11T06:10:23.240Z","updated_at":"2017-11-13T20:16:55.006Z","family_member_type":"old guard","parent_id":nil,"account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":13,"name":"Dan McGannon","partner":"Anne Rosamilia","created_at":"2017-11-11T06:10:38.031Z","updated_at":"2017-11-13T20:16:55.012Z","family_member_type":"old guard","parent_id":nil,"account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":14,"name":"Claire McGannon","partner":"Ash","created_at":"2017-11-11T06:10:48.396Z","updated_at":"2017-11-13T20:16:55.016Z","family_member_type":"young adult","parent_id":"13","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":15,"name":"Elena McGannon","partner":"Matt (Elena's BF)","created_at":"2017-11-11T06:11:32.141Z","updated_at":"2017-11-13T20:16:55.022Z","family_member_type":"young adult","parent_id":"13","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":16,"name":"Francesca McGannon","partner":"","created_at":"2017-11-11T06:11:42.693Z","updated_at":"2017-11-13T20:16:55.027Z","family_member_type":"young adult","parent_id":"13","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":17,"name":"James McGannon","partner":"","created_at":"2017-11-11T06:11:53.684Z","updated_at":"2017-11-13T20:16:55.035Z","family_member_type":"kid","parent_id":"13","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":18,"name":"Emily Maher","partner":"Peter Maher","created_at":"2017-11-11T06:12:14.493Z","updated_at":"2017-11-13T20:16:55.041Z","family_member_type":"old guard","parent_id":nil,"account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":19,"name":"Patrick Maher","partner":"","created_at":"2017-11-11T06:12:47.637Z","updated_at":"2017-11-13T20:16:55.047Z","family_member_type":"kid","parent_id":"18","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"},{"id":20,"name":"Oliver Maher","partner":"","created_at":"2017-11-11T06:12:58.980Z","updated_at":"2017-11-13T20:16:55.053Z","family_member_type":"kid","parent_id":"18","account_id":"LSo6Hua9SqSJmz256DaqMm8f","participating_this_year":"true"}])
