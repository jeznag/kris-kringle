Generates kris kringle matches based on the following business rules.
* 1. Kids shouldn't buy for parents, partners shouldn't buy for each other
* 2. People shouldn't buy for the same person they bought for the previous year
* 3. No recursive gift giving allowed
* 4. Financial situation should be respected so that young adults don't have to buy too many gifts
* 5. Any left over people should be assigned to a leftover pool

Uses a very inefficient graph searching approach to find matches based on social distance.

# TODO
- Fix select type issue
- Add field to signal not involved this year
- Put admin key in env variable
- Block brute forcing account ID
- Test mailers (email account URL)
- graph of gift giving

